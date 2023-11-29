import React from 'react';
import { Page, Document, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'gray',
    display: 'grid',
    justifyItems: 'center',
  },
  section: {
    margin: 5,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 3,
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: 'blue',
  },
  footer: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: 'blue',
  },
  content: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
});

const Receipt = ({ tenantName, phoneNumber, amountPaid, HouseNo, TenantID }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Water Payment Receipt</Text>
          <View>
            <Text style={styles.content}>Name: {tenantName}</Text>
            <Text style={styles.content}>Phone: {phoneNumber}</Text>
            <Text style={styles.content}>House: {HouseNo}</Text>
            <Text style={styles.content}>TenantID: {TenantID}</Text>
            <Text style={styles.content}>Total Amount Paid: Ksh {amountPaid}</Text>
            <Text style={styles.footer}>Enjoy your stay!</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default Receipt;
