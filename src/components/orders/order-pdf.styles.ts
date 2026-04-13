import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  // Header Section
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#000000',
  },
  headerColumn: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 8,
    fontSize: 9,
  },
  headerColumnLast: {
    padding: 8,
    fontSize: 9,
  },
  headerLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 9,
    marginBottom: 2,
  },
  headerBold: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  // Buyer & Shipping Section
  buyerContainer: {
    display: 'flex',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 16,
  },
  buyerColumnConsignee: {
    width: '25%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 8,
  },
  buyerColumnShipping: {
    width: '25%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 8,
  },
  buyerColumnLogistics: {
    width: '50%',
    padding: 8,
  },
  // Table Styles
  tableContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 16,
  },
  tableHeaderRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    backgroundColor: '#F1F5F9',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  tableRowLast: {
    display: 'flex',
    flexDirection: 'row',
  },
  colShippingMarks: {
    width: '22%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 6,
    fontSize: 8,
  },
  colDescription: {
    width: '35%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 6,
    fontSize: 8,
  },
  colWeight: {
    width: '15%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 6,
    fontSize: 8,
  },
  colUnitPrice: {
    width: '13%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 6,
    fontSize: 8,
    textAlign: 'right',
  },
  colTotalAmount: {
    width: '15%',
    padding: 6,
    fontSize: 8,
    textAlign: 'right',
  },
  // Totals Section
  totalsContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 16,
  },
  totalsRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  totalsRowLast: {
    display: 'flex',
    flexDirection: 'row',
  },
  totalsLabel: {
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 8,
    fontSize: 9,
    fontWeight: 'bold',
  },
  totalsValue: {
    width: '50%',
    padding: 8,
    fontSize: 9,
    textAlign: 'right',
  },
  grandTotalRow: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
  },
  grandTotalLabel: {
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    width: '50%',
    padding: 8,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  amountInWordsRow: {
    display: 'flex',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  amountInWordsLabel: {
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 8,
    fontSize: 8,
    fontWeight: 'bold',
  },
  amountInWordsValue: {
    width: '50%',
    padding: 8,
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Declaration & Signature
  declarationContainer: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 8,
    marginBottom: 16,
  },
  declarationLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  declarationText: {
    fontSize: 8,
    lineHeight: 1.4,
  },
  signatureContainer: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 8,
    textAlign: 'center',
  },
  signatureText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  signatureName: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 32,
  },
  signatureTitle: {
    fontSize: 8,
    marginTop: 4,
    color: '#666666',
  },
});
