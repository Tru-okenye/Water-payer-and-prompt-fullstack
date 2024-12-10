import React from 'react';
import { useLocation } from 'react-router-dom';
import Receipt from './Receipt';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import './App.css';

const Success = () => {
  const location = useLocation();
  const { receiptInfo } = location.state || {};

  return (
    <div className="Success">
      <div className="Successpage">
        {receiptInfo ? (
          <>
            <h2>Hello {receiptInfo.tenantName}</h2>
            <h3>You've successfully made your payment! View and download your receipt below.</h3>
            <div className="ReceiptViewer">
              <PDFViewer width="100%" height="600">
                <Receipt
                  tenantName={receiptInfo.tenantName}
                  phoneNumber={receiptInfo.phoneNumber}
                  amountPaid={receiptInfo.amountPaid}
                  HouseNo={receiptInfo.HouseNo}
                  TenantID={receiptInfo.TenantID}
                />
              </PDFViewer>
            </div>
            <button>
              <PDFDownloadLink
                document={
                  <Receipt
                    tenantName={receiptInfo.tenantName}
                    phoneNumber={receiptInfo.phoneNumber}
                    amountPaid={receiptInfo.amountPaid}
                    HouseNo={receiptInfo.HouseNo}
                    TenantID={receiptInfo.TenantID}
                  />
                }
                fileName="receipt.pdf"
                className="Link"
              >
                {({ blob, url, loading, error }) =>
                  loading ? 'Loading...' : error ? 'Error occurred while generating PDF' : 'Download Receipt'
                }
              </PDFDownloadLink>
            </button>
          </>
        ) : (
          <h2>No receipt information available.</h2>
        )}
      </div>
    </div>
  );
};

export default Success;
