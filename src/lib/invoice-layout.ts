/**
 * Invoice Layout Constants for Indian Customs-Compliant Commercial Invoice
 * Based on A4 portrait standard with percentage-based column widths
 */

export const INVOICE_LAYOUT = {
  // Page dimensions
  page: {
    aspectRatio: '1/1.414', // A4 aspect ratio
    maxWidth: 'max-w-4xl',
    backgroundColor: 'bg-white',
    padding: 'p-8',
    borderColor: 'border-black',
  },

  // Column widths (percentages that sum to 100%)
  columns: {
    shippingMarks: '22%', // Shipping Marks & Packages
    description: '35%', // Description of Goods
    weight: '15%', // Weight (Net/Gross in kg)
    unitPrice: '13%', // Unit Price (USD)
    totalAmount: '15%', // Total Amount (USD)
  },

  // Header sections (3-column layout)
  header: {
    exporter: '40%', // Left: Exporter Details
    invoiceDetails: '30%', // Middle: Invoice No & Date
    complianceIds: '30%', // Right: Compliance & Origin/Destination
  },

  // Buyer & Shipping sections (3-column layout, mirrors header)
  buyerShipping: {
    consignee: '40%', // Left: Consignee Details
    shippingAddress: '30%', // Middle: Shipping Address
    logistics: '30%', // Right: Logistics Details
  },

  // Typography
  typography: {
    fontFamily: 'font-sans', // Inter/Roboto via Tailwind
    baseSize: 'text-[10pt]',
    smallSize: 'text-[8pt]',
    headingSize: 'text-[12pt]',
    titleSize: 'text-[14pt]',
  },

  // Border and spacing
  borders: {
    cell: 'border border-black',
    headerBg: 'bg-slate-100',
    rowBg: 'bg-white',
  },

  // Sections
  sections: {
    header: 'mb-6',
    buyerShipping: 'mb-6',
    table: 'mb-6',
    totals: 'mb-6',
    declaration: 'mb-6',
    signature: 'text-center py-8',
  },
} as const;

/**
 * Helper function to calculate column width in grid
 * Returns Tailwind width class or percentage for inline styles
 */
export function getColumnWidth(columnKey: keyof typeof INVOICE_LAYOUT.columns): string {
  return INVOICE_LAYOUT.columns[columnKey];
}

/**
 * Helper to get header section widths
 */
export function getHeaderWidth(sectionKey: keyof typeof INVOICE_LAYOUT.header): string {
  return INVOICE_LAYOUT.header[sectionKey];
}

/**
 * Helper to get buyer/shipping section widths
 */
export function getBuyerShippingWidth(
  sectionKey: keyof typeof INVOICE_LAYOUT.buyerShipping
): string {
  return INVOICE_LAYOUT.buyerShipping[sectionKey];
}
