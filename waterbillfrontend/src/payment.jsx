import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const Payment = () => {
  const [tenantData, setTenantData] = useState(null);
  const { tenantId } = useParams();
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [isPaymentOngoing, setIsPaymentOngoing] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (tenantId) {
      setLoading(true);
      fetch(`http://127.0.0.1:8000/api/tenant-details/${tenantId}/`, {
        method: 'GET',
        credentials: 'include',
      })
        .then(response => response.json())
        .then(data => {
          setTenantData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching tenant details:', error);
          toast.error('Failed to load tenant details.');
          setLoading(false);
        });
    }
  }, [tenantId]);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setPaymentStatus('Initiating payment...'); // Show initiation message
      setPaymentChecked(false);
      setErrorMessage('');
      setIsPaymentSuccessful(false);
      setCheckoutRequestID('');

      // Fetch tenant details if not already fetched
      if (!tenantData) {
        await fetchTenantDetails();
      }

      const response = await fetch(`http://127.0.0.1:8000/api/tenants/${tenantId}/initiate-stk/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setPaymentStatus('STK push sent to your phone. Please enter your M-Pesa PIN to complete the payment.');
        setPaymentChecked(true);
        setCheckoutRequestID(result.checkoutRequestID);
        setIsPaymentOngoing(true); // Mark payment as ongoing
        // Do not call checkPaymentStatus immediately here
      } else {
        const errorResult = await response.json();
        console.error('Error response:', errorResult);
        if (errorResult.errorCode === '500.001.1001') {
          toast.error('Unable to initiate payment: A transaction is already in process for the current subscriber.');
        } else {
          toast.error('Failed to initiate payment.');
        }
        setPaymentStatus('Failed to initiate payment.'); // Display failure message
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment.');
      setPaymentStatus('Failed to initiate payment.'); // Display failure message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;

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

            if (ResultCode === '0') {
              setPaymentStatus(ResultDesc); // Payment successful
              setIsPaymentSuccessful(true); // Set the state to indicate payment success
              setIsPaymentOngoing(false); // Payment is no longer ongoing
              navigate('/Success', {
                state: {
                  receiptInfo: {
                    tenantName: tenantData.name,
                    phoneNumber: tenantData.phone_number,
                    amountPaid: tenantData.amount_due * 100,
                    HouseNo: tenantData.house_number,
                    TenantID: tenantData.tenant_id,
                  },
                },
              });
            } else if (ResultCode === '1032') {
              setPaymentStatus(ResultDesc); // Payment unsuccessful due to user cancellation
              setIsPaymentOngoing(false); // Payment is no longer ongoing
              console.log(tenantData.name)
              // navigate('/Success', {
              //   state: {
              //     receiptInfo: {
              //       tenantName: tenantData.name,
              //       phoneNumber: tenantData.phone_number,
              //       amountPaid: tenantData.amount_due * 100,
              //       HouseNo: tenantData.house_number,
              //       TenantID: tenantData.tenant_id,
              //     },
              //   },
              // });
            } else if (ResultCode === '1037') {
              setPaymentStatus(ResultDesc); // Payment timeout
              setIsPaymentOngoing(false); // Payment is no longer ongoing
            } else {
              setPaymentStatus('Payment failed or encountered an error.'); // Other error
              setIsPaymentOngoing(false); // Payment is no longer ongoing
            }
          } else if (queryResult.status === 'error') {
            const { errorMessage } = queryResult;
            setPaymentStatus(errorMessage);
            setErrorMessage(''); // Clear any previous error message
            setPaymentChecked(true); // Set paymentChecked to true to display the error message
          }
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
        // Don't set the payment status to a failure message here
      }
    };

    if (isPaymentOngoing && checkoutRequestID) {
      intervalId = setInterval(checkPaymentStatusWithInterval, 5000); // Check payment status every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Clear the interval when the component unmounts
      }
    };
  }, [isPaymentOngoing, checkoutRequestID, tenantData, navigate]);

  const renderPaymentDueMessage = () => {
    if (tenantData) {
      const currentDate = new Date();
      const dueDate = new Date(tenantData.due_date);
      const timeDifference = dueDate.getTime() - currentDate.getTime();
      const remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      return (
        <div className="PaymentPage">
          <div className="PaymentCard">
            <h2>{`Hey ${tenantData.name}, your payment is ${remainingDays > 0 ? `due in ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : `past due by ${Math.abs(remainingDays)} day${Math.abs(remainingDays) > 1 ? 's' : ''}`}.`}</h2>
            <p>{`Phone Number: ${tenantData.phone_number}`}</p>
            <p>{`Amount Due: ${tenantData.amount_due}`}</p>
            <div>
              {isPaymentOngoing && !isPaymentSuccessful ? (
                <p className="Message Info">{paymentStatus}</p>
              ) : (
                <button onClick={initiatePayment} disabled={loading}>PAY</button>
              )}
              {paymentChecked && isPaymentSuccessful && (
                <p className="Message Success">{paymentStatus}</p>
              )}
              {paymentChecked && !isPaymentSuccessful && !isPaymentOngoing && (
                <p className={`Message ${paymentStatus.includes('cancelled') || paymentStatus.includes('timeout') ? 'Warning' : 'Error'}`}>{paymentStatus}</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };


  const renderLoadingMessage = () => (
    <div className="LoadingContainer">
      <p className="LoadingMessage">Loading...</p>
    </div>
  );

  return (
    <div className="Payreturn">
      {loading ? renderLoadingMessage() : renderPaymentDueMessage() || <h1>Details loading</h1>}
      <ToastContainer />
    </div>
  );
};

export default Payment;
