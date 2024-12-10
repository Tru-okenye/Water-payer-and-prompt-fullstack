import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  value: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  footer: {
    marginTop: 10,
    marginBottom: 210,
    textAlign: 'center',
    fontSize: 14,
    color: '#aaa',
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
   
  },
});

// Create Receipt component
const Receipt = ({ tenantName, phoneNumber, amountPaid, HouseNo, TenantID }) => {
  const today = new Date();
  const formattedDate = `${today.toLocaleDateString()} ${today.toLocaleTimeString()}`;

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Water Payment Receipt</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{tenantName}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{phoneNumber}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>House Number:</Text>
          <Text style={styles.value}>{HouseNo}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Tenant ID:</Text>
          <Text style={styles.value}>{TenantID}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Total Amount Paid:</Text>
          <Text style={styles.value}>Ksh {amountPaid}</Text>
        </View>
        <View style={styles.footer}>
          <Text>Receipt generated on: {formattedDate}</Text>
          <Text>Thank you for your payment!</Text>
          <Text>Enjoy your stay!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default Receipt;
