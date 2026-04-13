'use client';

import { buildOrderContent } from '@/lib/build-order-content';
import { formatCurrency } from '@/lib/order-utils';
import type { CompanyProfile, OrderWithBuyer } from '@/types';
import { Document, Font, Page, PDFDownloadLink, Text, View } from '@react-pdf/renderer';
import { pdfStyles as styles } from './order-pdf.styles';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHAPUtQ8E0.ttf',
});

interface CommercialOrderPDFProps {
  order: OrderWithBuyer;
  companyProfile: CompanyProfile | null;
}

function CommercialOrderPDFContent({ order, companyProfile }: CommercialOrderPDFProps) {
  const content = buildOrderContent(order, companyProfile!);

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

export function CommercialOrderPDF({ order, companyProfile }: CommercialOrderPDFProps) {
  const filename = `Commercial_Order_${order.documentNumber.replace(/\D/g, '')}.pdf`;

  return (
    <PDFDownloadLink
      document={<CommercialOrderPDFContent order={order} companyProfile={companyProfile} />}
      fileName={filename}
      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
    >
      {({ loading }) => (loading ? 'Generating...' : '⬇ Download PDF')}
    </PDFDownloadLink>
  );
}
