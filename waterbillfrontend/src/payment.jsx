import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';


const checkPaymentStatus = async ( checkoutRequestID, setPaymentStatus, setPaymentChecked, setErrorMessage) => {
  try {
    const queryResponse = await fetch('http://127.0.0.1:8000/api/payment-callback/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ checkoutRequestID }),
    }).catch(error => console.error('Fetch error:', error))

    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('Query Result:', queryResult);
      
      if (queryResult.status === 'success') {
        const { ResultCode, ResultDesc} = queryResult;
        

        if (ResultCode === '0') {
          setPaymentStatus(ResultDesc); // Payment successful
          setPaymentChecked(true); // Set paymentChecked to true to display the payment status
          return;  // Payment successful
        } else if (ResultCode === '1032') {
       setPaymentStatus(ResultDesc); // Payment successful
          setPaymentChecked(true); // Set paymentChecked to true to display the payment status
        } else {
          setPaymentStatus('Payment failed or encountered an error.'); // Other error
        }

        setErrorMessage(''); // Clear any previous error message
        setPaymentChecked(true); // Set paymentChecked to true to display the payment status
      } else if (queryResult.status === 'error') {
        const { errorMessage } = queryResult;
        
        setPaymentStatus(errorMessage);
        setErrorMessage(''); // Clear any previous error message
        setPaymentChecked(true); // Set paymentChecked to true to display the error message
      } else {
        // Handle any other unexpected response here
        setPaymentStatus('Failed to get payment status.');
        setErrorMessage('Failed to get payment status.'); // Set an error message for the failure to get status
        setPaymentChecked(true); // Set paymentChecked to true to display the error message
      }
    } else {
      setPaymentStatus('Failed to check payment status.');
      setErrorMessage('Failed to check payment status.'); // Set an error message for the failure to check status
      setPaymentChecked(true); // Set paymentChecked to true to display the error message
    }
  } catch (error) {
    console.error('Failed to check payment status:', error);
    setPaymentStatus('Failed to check payment status.');
    setErrorMessage('Failed to check payment status. Please try again later.');
    setPaymentChecked(true); // Set paymentChecked to true to display the error message
  }
};




const Payment = () => {
  const [tenantData, setTenantData] = useState(null);
 const { tenantId } = useParams();
 const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch tenant details from your Django backend API endpoint using tenantId
    
    if (tenantId) {
      fetch(`http://127.0.0.1:8000/api/tenant-details/${tenantId}/`, {
        method: 'GET',
        credentials: 'include',
      })
        .then(response => response.json())
        .then(data => setTenantData(data))
        .catch(error => console.error('Error fetching tenant details:', error));
    }
  }, [tenantId]);
 const initiatePayment = async () => {
    try {
      setPaymentStatus('');
      setPaymentChecked(false);
      setErrorMessage('');
      setIsPaymentSuccessful(false);
      setCheckoutRequestID('');
        const response = await fetch(`http://127.0.0.1:8000/api/tenants/${tenantId}/initiate-stk/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
           
        });


        console.log('Response:', response);

        if (response.ok) {
          const result = await response.json();
          setPaymentStatus('STK push sent to your phone. Please enter your M-Pesa PIN to accept the payment.');
          setPaymentChecked(true); 
            setCheckoutRequestID(result.checkoutRequestID);
             
      // Start polling for payment status
       checkPaymentStatus(result.checkoutRequestID, setPaymentStatus, setPaymentChecked, setErrorMessage);
            console.log('Success:', result);
        } else {
            const errorResult = await response.json();
            console.error('Error response:', errorResult);
        }
    } catch (error) {
        console.error('Error initiating payment:', error);
        setPaymentStatus('Failed to initiate payment. Please try again later.');
    }
};

// Use useEffect to start polling for payment status when checkoutRequestID changes
 useEffect(() => {
    let intervalId; // Variable to hold the interval ID

    const checkPaymentStatusWithInterval = async () => {
      try {
        const queryResponse = await fetch('http://127.0.0.1:8000/api/payment-callback/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ checkoutRequestID }),
        });

        if (queryResponse.ok) {
          const queryResult = await queryResponse.json();
          console.log('Query Result:', queryResult);

          if (queryResult.status === 'success') {
            const { ResultCode, ResultDesc } = queryResult;

            if (ResultCode === '0' ) {
              setPaymentStatus(ResultDesc); // Payment successful
              setIsPaymentSuccessful(true); // Set the state to indicate payment success
  
             navigate('/Success', {state: {
            recieptInfo : {
              tenantName: tenantData.name,
              phoneNumber: tenantData.phone_number,
              amountPaid: tenantData.amount_due * 100, 
              HouseNo: tenantData.house_number,
              TenantID: tenantData.tenant_id,
            },
             },
            });
              return; // Payment successful
            } else if (ResultCode === '1032') {
              setPaymentStatus(ResultDesc); // Payment successful
              setIsPaymentSuccessful(true); // Set the state to indicate payment success
            
              return; // Payment successful
            }
            else {
              setPaymentStatus('Payment failed or encountered an error.'); // Other error
            }
          } else if (queryResult.status === 'error') {
            const { errorMessage  } = queryResult;
      

            setPaymentStatus(errorMessage);
            setErrorMessage(''); // Clear any previous error message
            setPaymentChecked(true); // Set paymentChecked to true to display the error message
          } else {
            // Handle any other unexpected response here
            setPaymentStatus('Failed to get payment status.');
            setErrorMessage('Failed to get payment status.'); // Set an error message for the failure to get status
            setPaymentChecked(true); // Set paymentChecked to true to display the error message
          }
        } else {
          setPaymentStatus('Failed to check payment status.');
          setErrorMessage('Failed to check payment status.'); // Set an error message for the failure to check status
          setPaymentChecked(true); // Set paymentChecked to true to display the error message
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
        setPaymentStatus('Failed to check payment status.');
        setErrorMessage('Failed to check payment status. Please try again later.');
        setPaymentChecked(true); // Set paymentChecked to true to display the error message
      }
    };

    if (checkoutRequestID && !isPaymentSuccessful) {
      // Start polling for payment status immediately
      checkPaymentStatusWithInterval();

      // Start polling every 1 second (1000ms)
      intervalId = setInterval(checkPaymentStatusWithInterval, 1000);
    }

    return () => {
      // Clean up the interval when the component is unmounted or payment is successful
      clearInterval(intervalId);
    };
  }, [checkoutRequestID, isPaymentSuccessful]);
const renderPaymentDueMessage = () => {
  if (tenantData && tenantData.due_date) {
    const currentDate = new Date();
    const dueDate = new Date(tenantData.due_date);

    // Calculate the difference in days between the current date and due date
    const timeDifference = dueDate.getTime() - currentDate.getTime();
    const remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    if (currentDate > dueDate && !tenantData.is_paid) {
      const daysPastDue = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));

      return (
        <div className="Payment">
          <p>{`Hey ${tenantData.name}, your payment is past due by ${daysPastDue} day${daysPastDue > 1 ? 's' : ''}.`}</p>
          <p>{`Phone Number: ${tenantData.phone_number}`}</p>
          <p>{`Amount Due: ${tenantData.amount_due * 100}`}</p>
          <div>
            <button onClick={initiatePayment}>PAY</button>
            {paymentChecked && paymentStatus && <p>{paymentStatus}</p>}
          </div>
        </div>
      );
    } else if (currentDate >= dueDate && !tenantData.is_paid) {
      // Due date is today
      return (
        <div className="Payment">
          <p>{`Hey ${tenantData.name}, today is the due date for your payment.`}</p>
          <p>{`Phone Number: ${tenantData.phone_number}`}</p>
          <p>{`Amount Due: ${tenantData.amount_due * 100}`}</p>
          <div>
            <button onClick={initiatePayment}>PAY</button>
            {paymentChecked && paymentStatus && <p>{paymentStatus}</p>}
          </div>
        </div>
      );
    } else {
      // Payment is not past due
      return (
        <div className="Payment">
          <p>{`Your payment is due in ${remainingDays} day${remainingDays > 1 ? 's' : ''}.`}</p>
        </div>
      );
    }
  }

  return null;
};


 return (
    <div className="Payreturn">
      {renderPaymentDueMessage() || <h1>Details loading</h1>}
    </div>
  );
};

export default Payment;
