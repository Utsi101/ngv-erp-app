'use client';

import { useOrderContent } from '@/hooks/useOrderContent';
import { formatCurrency } from '@/lib/order-utils';
import type { CompanyProfile, OrderWithBuyer } from '@/types/order';
import { Document, Font, Page, PDFDownloadLink, StyleSheet, Text, View } from '@react-pdf/renderer';

// Register Helvetica font for cross-platform consistency
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHAPUtQ8E0.ttf',
});

// PDF Styles
const styles = StyleSheet.create({
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

interface CommercialOrderPDFProps {
  order: OrderWithBuyer;
  companyProfile: CompanyProfile | null;
}

function CommercialOrderPDFContent({ order, companyProfile }: CommercialOrderPDFProps) {
  const content = useOrderContent(order, companyProfile!);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* TITLE */}
        <Text style={styles.title}>COMMERCIAL ORDER</Text>

        {/* HEADER SECTION - 3 COLUMNS */}
        <View style={styles.headerContainer}>
          {/* Left Column: Exporter */}
          <View style={{ ...styles.headerColumn, width: '25%' }}>
            <Text style={styles.headerLabel}>EXPORTER</Text>
            <Text style={styles.headerBold}>{content.header.exporter.name}</Text>
            <Text style={styles.headerText}>
              {content.header.exporter.address1}
              {content.header.exporter.address2 && `, ${content.header.exporter.address2}`}
            </Text>
            <Text style={styles.headerText}>
              {companyProfile?.city}, {companyProfile?.state} {companyProfile?.pincode}
            </Text>
            <Text style={{ ...styles.headerText, marginTop: 6 }}>
              <Text style={{ fontWeight: 'bold' }}>GSTIN:</Text> {content.header.exporter.gstin}
            </Text>
            <Text style={styles.headerText}>
              <Text style={{ fontWeight: 'bold' }}>IEC:</Text> {content.header.exporter.iec}
            </Text>
            <Text style={styles.headerText}>
              <Text style={{ fontWeight: 'bold' }}>PAN:</Text> {content.header.exporter.pan}
            </Text>
            <Text style={styles.headerText}>
              <Text style={{ fontWeight: 'bold' }}>AD Code:</Text> {content.header.exporter.adCode}
            </Text>
          </View>

          {/* Middle Column: Order Details */}
          <View style={{ ...styles.headerColumn, width: '25%' }}>
            <Text style={styles.headerLabel}>ORDER NO. & DATE</Text>
            <Text style={styles.headerBold}>{content.header.invoiceDetails.number}</Text>
            <Text style={styles.headerText}>{content.header.invoiceDetails.date}</Text>
            <Text style={{ ...styles.headerLabel, marginTop: 12 }}>CONTRACT NO. & DATE</Text>
            <Text style={styles.headerText}>{content.header.invoiceDetails.contractNumber}</Text>
          </View>

          {/* Right Column: Compliance IDs */}
          <View style={{ ...styles.headerColumnLast, width: '50%' }}>
            <Text style={styles.headerLabel}>IEC CODE NO.</Text>
            <Text style={styles.headerText}>{content.header.complianceIds.iecCode}</Text>

            <Text style={{ ...styles.headerLabel, marginTop: 8 }}>COUNTRY OF ORIGIN</Text>
            <Text style={styles.headerText}>{content.header.complianceIds.origin}</Text>

            <Text style={{ ...styles.headerLabel, marginTop: 8 }}>COUNTRY OF DESTINATION</Text>
            <Text style={styles.headerText}>{content.header.complianceIds.destination}</Text>
          </View>
        </View>

        {/* BUYER & SHIPPING SECTION */}
        <View style={styles.buyerContainer}>
          {/* Left Column: Consignee */}
          <View style={styles.buyerColumnConsignee}>
            <Text style={styles.headerLabel}>CONSIGNEE</Text>
            <Text style={styles.headerBold}>{content.buyerShipping.consignee.companyName}</Text>
            {content.buyerShipping.consignee.contactPerson !== '—' && (
              <Text style={styles.headerText}>
                Contact: {content.buyerShipping.consignee.contactPerson}
              </Text>
            )}
            <Text style={{ ...styles.headerText, marginTop: 4 }}>
              {content.buyerShipping.consignee.billingAddress}
            </Text>
          </View>

          {/* Middle Column: Shipping Address */}
          <View style={styles.buyerColumnShipping}>
            <Text style={styles.headerLabel}>SHIPPING ADDRESS</Text>
            <Text style={styles.headerText}>{content.buyerShipping.shippingAddress}</Text>
          </View>

          {/* Right Column: Logistics */}
          <View style={styles.buyerColumnLogistics}>
            <Text style={styles.headerLabel}>LOGISTICS</Text>
            <Text style={styles.headerText}>
              <Text style={{ fontWeight: 'bold' }}>Terms:</Text>{' '}
              {content.buyerShipping.logistics.incoterm}
            </Text>
            <Text style={styles.headerText}>
              <Text style={{ fontWeight: 'bold' }}>Vessel:</Text>{' '}
              {content.buyerShipping.logistics.vessel}
            </Text>
            <Text style={styles.headerText}>
              <Text style={{ fontWeight: 'bold' }}>Port of Loading:</Text>{' '}
              {content.buyerShipping.logistics.portOfLoading}
            </Text>
            <Text style={styles.headerText}>
              <Text style={{ fontWeight: 'bold' }}>Port of Discharge:</Text>{' '}
              {content.buyerShipping.logistics.portOfDischarge}
            </Text>
          </View>
        </View>

        {/* LINE ITEMS TABLE */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={{ ...styles.colShippingMarks, fontWeight: 'bold' }}>
              Shipping Marks & Pkgs
            </Text>
            <Text style={{ ...styles.colDescription, fontWeight: 'bold' }}>
              Description of Goods
            </Text>
            <Text style={{ ...styles.colWeight, fontWeight: 'bold' }}>Weight (kg)</Text>
            <Text style={{ ...styles.colUnitPrice, fontWeight: 'bold' }}>Unit Price USD</Text>
            <Text style={{ ...styles.colTotalAmount, fontWeight: 'bold' }}>Amount USD</Text>
          </View>

          {/* Table Rows */}
          {content.lineItems.map((item, idx) => (
            <View
              key={item.id}
              style={idx === content.lineItems.length - 1 ? styles.tableRowLast : styles.tableRow}
            >
              <View style={styles.colShippingMarks}>
                <Text>{item.skuFull}</Text>
                <Text>Qty: {item.quantity}</Text>
              </View>
              <View style={styles.colDescription}>
                <Text style={{ fontWeight: 'bold' }}>{item.description}</Text>
                <Text>HS Code: {item.hsCode}</Text>
              </View>
              <View style={styles.colWeight}>
                <Text>Net: {item.netWeight}</Text>
                <Text>Gross: {item.grossWeight}</Text>
              </View>
              <View style={styles.colUnitPrice}>
                <Text>{formatCurrency(item.unitPrice)}</Text>
              </View>
              <View style={styles.colTotalAmount}>
                <Text style={{ fontWeight: 'bold' }}>{formatCurrency(item.lineTotal)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* TOTALS SECTION */}
        <View style={styles.totalsContainer}>
          {/* Freight & Insurance */}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Freight Charges</Text>
            <Text style={styles.totalsValue}>{formatCurrency(content.totals.freight)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Insurance</Text>
            <Text style={styles.totalsValue}>{formatCurrency(content.totals.insurance)}</Text>
          </View>

          {/* Grand Total */}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL AMOUNT CHARGEABLE (USD)</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(content.totals.grandTotal)}</Text>
          </View>

          {/* Amount in Words */}
          <View style={styles.amountInWordsRow}>
            <Text style={styles.amountInWordsLabel}>AMOUNT CHARGEABLE IN WORDS</Text>
            <Text style={styles.amountInWordsValue}>{content.totals.amountInWords}</Text>
          </View>
        </View>

        {/* DECLARATION */}
        <View style={styles.declarationContainer}>
          <Text style={styles.declarationLabel}>DECLARATION</Text>
          <Text style={styles.declarationText}>{content.declaration}</Text>
        </View>

        {/* SIGNATURE SECTION */}
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureText}>For {content.signature.company}</Text>
          <Text style={styles.signatureName}>AUTHORISED SIGNATORY</Text>
          <Text style={styles.signatureTitle}>Name & Designation</Text>
        </View>
      </Page>
    </Document>
  );
}

export interface OrderPDFProps extends CommercialOrderPDFProps {}

export function CommercialOrderPDF({ order, companyProfile }: CommercialOrderPDFProps) {
  const filename = `Commercial_Order_${order.documentNumber.replace(/\D/g, '')}.pdf`;

  return (
    <PDFDownloadLink
      document={<CommercialOrderPDFContent order={order} companyProfile={companyProfile} />}
      fileName={filename}
      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
    >
      {({ blob, url, loading, error }) => (loading ? 'Generating...' : '⬇ Download PDF')}
    </PDFDownloadLink>
  );
}
