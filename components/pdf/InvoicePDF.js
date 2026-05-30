import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  header: { marginBottom: 30, borderBottom: 1, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 12, color: '#666' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, backgroundColor: '#f3f4f6', padding: 5 },
  table: { marginTop: 10, marginBottom: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 8, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  col1: { width: '60%' },
  col2: { width: '20%', textAlign: 'right' },
  col3: { width: '20%', textAlign: 'right' },
  total: { marginTop: 20, paddingTop: 10, borderTopWidth: 2, borderTopColor: '#000', flexDirection: 'row', justifyContent: 'flex-end' },
  totalText: { fontSize: 14, fontWeight: 'bold' },
  paymentBox: { marginTop: 20, padding: 10, backgroundColor: '#f0fdf4', borderRadius: 5 },
  paymentText: { fontSize: 10, textAlign: 'center', marginBottom: 5 },
  paymentLink: { fontSize: 9, textAlign: 'center', color: '#2563eb' },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#666', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 }
})

export default function InvoicePDF({ invoice, business }) {
  // REPLACE THIS WITH YOUR ACTUAL STRIPE PAYMENT LINK
  const stripeLink = "https://buy.stripe.com/7sY00j8bsas3aL7bhQao800"
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{business?.name || 'SheetInvoicer'}</Text>
          <Text style={styles.subtitle}>{business?.address || 'Business Address'}</Text>
          <Text style={styles.subtitle}>Tax ID: {business?.tax_id || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <View>
            <Text>Invoice Number:</Text>
            <Text style={{ fontWeight: 'bold' }}>{invoice.invoice_number}</Text>
          </View>
          <View>
            <Text>Date:</Text>
            <Text>{new Date(invoice.created_at).toLocaleDateString()}</Text>
          </View>
          <View>
            <Text>Status:</Text>
            <Text>{invoice.status?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text style={{ fontWeight: 'bold' }}>{invoice.clients?.name}</Text>
          <Text>{invoice.clients?.email}</Text>
          <Text>{invoice.clients?.address}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Quantity</Text>
            <Text style={styles.col3}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.col1}>{invoice.notes || 'Service charge'}</Text>
            <Text style={styles.col2}>1</Text>
            <Text style={styles.col3}>${invoice.total?.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.total}>
          <View style={{ width: 200 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalText}>${invoice.total?.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentBox}>
          <Text style={styles.paymentText}>💳 Pay Online</Text>
          <Text style={styles.paymentLink}>{stripeLink}?amount={invoice.total}</Text>
        </View>

        <Text style={styles.footer}>Thank you for your business!</Text>
      </Page>
    </Document>
  )
}