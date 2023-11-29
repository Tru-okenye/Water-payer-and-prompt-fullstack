import React from 'react';
import { useLocation } from 'react-router-dom';
import Receipt from './Receipt';
import { PDFDownloadLink } from '@react-pdf/renderer';
import './App.css';
const Success = () => {
  const location = useLocation();
  const { recieptInfo } = location.state || {};

  return (
    <>
    <div className="Success">

    <div className="Successpage">
      <div>
        <h2>Hello {recieptInfo.tenantName}</h2>
        <h3>You've successfully made your payment!! Download your receipt</h3>
      </div>
      <div>
        <button>
  
          <PDFDownloadLink
            document={
              <Receipt
                tenantName={recieptInfo.tenantName}
                phoneNumber={recieptInfo.phoneNumber}
                amountPaid={recieptInfo.amountPaid}
                HouseNo={recieptInfo.HouseNo}
                TenantID={recieptInfo.TenantID}
              />
            }
            fileName="receipt.pdf" className="Link"
          >
            {({ blob, url, loading, error }) =>
              loading ? 'Loading...' : error ? 'Error occurred while generating PDF' : 'Download Receipt'
            }
          </PDFDownloadLink>
        </button>
      </div>
    </div>
    </div>
    </>
  );
};

export default Success;
