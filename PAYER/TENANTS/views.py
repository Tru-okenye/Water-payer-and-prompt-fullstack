# views.py

  
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Tenant, PaymentTransaction
from .serializers import TenantSerializer
from django.http import JsonResponse
import requests
from requests.auth import HTTPBasicAuth
from django.views.decorators.csrf import csrf_exempt
from requests.exceptions import RequestException, HTTPError
from django.utils import timezone
from datetime import timedelta


import json

from django.shortcuts import get_object_or_404
from .credentials import generate_access_token, generate_password, generate_timestamp
from django.conf import settings

# tenants records 
class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer

  
@csrf_exempt
def verify_login(request):
    if request.method == 'POST':
        try:
            # Use request.body to get the raw JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Extract the values from the JSON data
            name = data.get('name')
            tenant_id = data.get('tenant_id')

            print(f"Received data - Name: {name}, Tenant ID: {tenant_id}")

            # Check if the tenant exists
            try:
                tenant = get_object_or_404(Tenant, name=name, tenant_id=tenant_id)
                return JsonResponse({'success': True, 'message': 'Login successful'})
            except:
                return JsonResponse({'success': False, 'message': 'Invalid login credentials'})

        except json.JSONDecodeError as e:
            return JsonResponse({'success': False, 'message': 'Invalid JSON data in the request'}, status=400)

    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def authenticated_tenant_details(request, tenant_id):
    if request.method == 'GET':
        try:
            tenant = Tenant.objects.get(tenant_id=tenant_id)

            data = {
                'id': tenant.id,
                'name': tenant.name,
                'phone_number': tenant.phone_number,
                'amount_due': tenant.amount_due,
                'house_number':tenant.house_number,
                'tenant_id': tenant.tenant_id,
                'is_paid': tenant.is_paid,
                'due_date':tenant.due_date, 
            }

            return JsonResponse(data)
        except Tenant.DoesNotExist:
            return JsonResponse({'error': 'Tenant details not found'}, status=404)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


# payment handling 
@api_view(['POST'])
def initiate_stk(request, tenant_id):
    #     # Get the API endpoint from settings
    ENDPOINT = settings.ENDPOINT
    
    print(f"Received request with tenant_id: {tenant_id}")
    tenant = Tenant.objects.get(tenant_id=tenant_id)
    phone_number = tenant.phone_number
    reference_id = f"PAYMENT_{tenant.id}"
    formatted_amount = int(tenant.amount_due * 100)  # convert to cents
    # Generate access token and password for authentication
    access_token = generate_access_token()
    password = generate_password()
    print(f"Password: {password}")
#     # Prepare payload for the Safaricom API request
    payload = {
        'BusinessShortCode': settings.BUSINESS_SHORT_CODE,
        'Password': password,
        'Timestamp': generate_timestamp(),
        'TransactionType': 'CustomerBuyGoodsOnline',
        'Amount': formatted_amount,
        'PartyA': phone_number,
        'PartyB': '8676510',
        'PhoneNumber': phone_number,
        'CallBackURL': 'https://water-payer-37119e2b1a5e.herokuapp.com/api/payment-callback/',
        'AccountReference': reference_id,
        'TransactionDesc': 'Water Bill Payment',
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + access_token
    }
    print("Request Headers:", headers)

    try:
        print("Before the request to Safaricom API")
        # Send the request to the Safaricom API
        response = requests.post(ENDPOINT, json=payload, headers=headers)
        print("After the request to Safaricom API")
        # Log request details
        print("Request Payload:", payload)
        print("Response Status Code:", response.status_code)
        print("Response Text:", response.text)

        if response.status_code == 200:
            # If the response status code is 200, extract information from the response
            response_data = response.json()

            # Extract the information needed for STK push from the response
            merchant_request_id = response_data.get('MerchantRequestID')
            checkout_request_id = response_data.get('CheckoutRequestID')
            # Save checkout_request_id in the Tenant model
            tenant.checkout_request_id = checkout_request_id
            tenant.save()

            # Return success response to your React frontend
            return Response({
                'status': 'success',
                'message': 'Payment initiation successful',
                'merchant_request_id': merchant_request_id,
                'checkoutRequestID': checkout_request_id,
            })



        else:
            # If the response status code is not 200, handle the error
            return Response({"status": "error", "error": f"Invalid response {response.text}"}, status=response.status_code)

    except HTTPError as e:
        # Handle HTTP errors
        response_data = {"status": "error", "error": f"HTTP error: {str(e)}"}
        return Response(response_data, status=500)

    except RequestException as e:
        # Handle other request exceptions
        response_data = {"status": "error", "error": f"Failed to initiate payment: {str(e)}"}
        return Response(response_data, status=500)



@api_view(['POST'])
def payment_callback(request):
    # Get the API endpoint for STK push query from settings
    QUERY_ENDPOINT = settings.QUERY
    
    data = json.loads(request.body.decode('utf-8'))

    # Get the associated Tenant and checkout_request_id
   
    checkout_request_id = data.get('checkoutRequestID')
    
    # Generate access token for authentication
    access_token = generate_access_token()

    # Prepare payload for the Safaricom API request
    payload = {
        'BusinessShortCode': settings.BUSINESS_SHORT_CODE,
        'Password': generate_password(),
        'Timestamp': generate_timestamp(),
        'CheckoutRequestID': checkout_request_id,
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + access_token
    }

    try:
        # Send the request to the Safaricom API for STK push query
        response = requests.post(QUERY_ENDPOINT, json=payload, headers=headers)
        
        # Log request details
        print("STK Query Request Payload:", payload)
        print("STK Query Response Status Code:", response.status_code)
        print("STK Query Response Text:", response.text)

        if response.status_code == 200:
            # If the response status code is 200, extract information from the response
            response_data = response.json()

            # Extract the result code and result description from the response
            result_code = response_data.get('ResultCode')
            result_description = response_data.get('ResultDesc')
         # Check if the payment was successful (ResultCode is '0')
            if result_code == '0':
                # Update the Tenant's is_paid field to True
                try:
                    print(f"Attempting to update tenant with checkout_request_id: {checkout_request_id}")
                    tenant = Tenant.objects.get(checkout_request_id=checkout_request_id)
                    tenant.is_paid = True
                    tenant.due_date = timezone.now() + timedelta(days=30)
                    tenant.save()
                    print("Update successful")
                except Tenant.DoesNotExist:
                    print("Tenant not found.")
                except Exception as e:
                    print(f"An error occurred: {str(e)}")

            # # Return the result code and result description to your React frontend
            return Response({
                'status': 'success',
                'message': 'STK push query successful',
                'ResultCode': result_code,
                'ResultDesc': result_description,
            })

        else:
            # If the response status code is not 200, handle the error
            return Response({"status": "error", "errorMessage": f"Invalid response {response.text}"}, status=response.status_code)

    except HTTPError as e:
        # Handle HTTP errors
        response_data = {"status": "error", "errorMessage": f"HTTP error: {str(e)}"}
        return Response(response_data, status=500)

    except RequestException as e:
        # Handle other request exceptions
        response_data = {"status": "error", "erroMessage": f"Failed to query STK push status: {str(e)}"}
        return Response(response_data, status=500)
