import requests
from django.conf import settings
from requests.auth import HTTPBasicAuth
from datetime import datetime
import base64
import hashlib
import logging

from decouple import config  

logger = logging.getLogger(__name__)

# Load values from environment variables
API_KEY = config('API_KEY')
API_SECRET = config('API_SECRET')
PASS_KEY = config('PASS_KEY')
BUSINESS_SHORT_CODE = config('BUSINESS_SHORT_CODE')


def generate_access_token():
    # Make the request to the token URL using client credentials
    auth = HTTPBasicAuth(settings.API_KEY, settings.API_SECRET)
    print("Before generate_access_token")
    print("Token URL:", settings.TOKEN_URL)

    try:
        res = requests.get(
            settings.TOKEN_URL,
            auth=auth
        )
        print("Token Endpoint Response:", res.status_code, res.json())
        res.raise_for_status()  # Raise an exception for bad responses (4xx or 5xx)

        json_response = res.json()
        access_token = json_response.get("access_token")
        print(f"Generated access token: {access_token}")
        return access_token

    except requests.exceptions.RequestException as e:
        # Log the error for debugging
        print(f"Error during token generation: {str(e)}")
        print(f"Response content: {res.text}") 
        return None

    except ValueError as e:
        # Log the error for debugging
        print(f"Error decoding JSON during token generation: {str(e)}")
        return None


def generate_password():
    # Generate password
    timestamp = generate_timestamp()
    data = BUSINESS_SHORT_CODE + PASS_KEY + timestamp
    password_bytes = data.encode("ascii")
    password = base64.b64encode(password_bytes).decode("utf-8")

    print(f"Generated Password: {password}") 
    return password

def generate_timestamp():
    # Generate timestamp
    
    return datetime.now().strftime("%Y%m%d%H%M%S")


