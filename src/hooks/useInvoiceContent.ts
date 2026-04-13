'use client';

import { CompanyProfile } from '@/app/profile/profile-form';
import { getAmountInWords } from '@/lib/currency-to-words';
import { formatInvoiceDate, INVOICE_DECLARATION, safeValue } from '@/lib/invoice-utils';
import type { OrderWithBuyer } from '@/types/invoice';

/**
 * Organized invoice content structure
 * Used by both web (InvoiceModal) and PDF (InvoicePDF) renderers
 */
export interface InvoiceContent {
  header: {
    exporter: {
      name: string;
      address1: string;
      address2: string;
      gstin: string;
      iec: string;
      pan: string;
      adCode: string;
    };
    invoiceDetails: {
      number: string;
      date: string;
      contractNumber: string;
    };
    complianceIds: {
      iecCode: string;
      origin: string;
      destination: string;
    };
  };
  buyerShipping: {
    consignee: {
      companyName: string;
      contactPerson: string;
      billingAddress: string;
    };
    shippingAddress: string;
    logistics: {
      incoterm: string;
      vessel: string;
      portOfLoading: string;
      portOfDischarge: string;
    };
  };
  lineItems: Array<{
    id: string;
    skuFull: string;
    quantity: number;
    description: string;
    hsCode: string;
    netWeight: number;
    grossWeight: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  totals: {
    freight: number;
    insurance: number;
    grandTotal: number;
    amountInWords: string;
  };
  declaration: string;
  signature: {
    company: string;
  };
}

/**
 * Hook to organize invoice data into a structured content model
 * Eliminates duplication between web and PDF renderers
 */
export function useInvoiceContent(
  order: OrderWithBuyer,
  companyProfile: CompanyProfile | null
): InvoiceContent {
  return {
    header: {
      exporter: {
        name: safeValue(companyProfile?.companyName),
        address1: safeValue(companyProfile?.addressLine1),
        address2: companyProfile?.addressLine2 ? `${companyProfile.addressLine2}` : '',
        gstin: safeValue(companyProfile?.gstin),
        iec: safeValue(companyProfile?.iecCode),
        pan: safeValue(companyProfile?.pan),
        adCode: safeValue(companyProfile?.adCode),
      },
      invoiceDetails: {
        number: order.documentNumber,
        date: formatInvoiceDate(order.createdAt),
        contractNumber: safeValue(order.appliedLutNumber),
      },
      complianceIds: {
        iecCode: safeValue(companyProfile?.iecCode),
        origin: 'INDIA',
        destination: order.buyer.country,
      },
    },
    buyerShipping: {
      consignee: {
        companyName: order.buyer.companyName,
        contactPerson: safeValue(order.buyer.contactPerson),
        billingAddress: order.buyer.billingAddress,
      },
      shippingAddress: order.buyer.shippingAddress,
      logistics: {
        incoterm: order.incoterm,
        vessel: safeValue(order.vesselName),
        portOfLoading: safeValue(order.portOfLoading),
        portOfDischarge: safeValue(order.portOfDischarge),
      },
    },
    lineItems: order.items.map((item) => ({
      id: item.id,
      skuFull: safeValue(item.skuFull),
      quantity: item.quantity,
      description: item.historicalDescription,
      hsCode: item.historicalHsCode,
      netWeight: item.historicalNetWeight,
      grossWeight: item.historicalGrossWeight,
      unitPrice: item.historicalUnitPrice,
      lineTotal: item.lineTotal,
    })),
    totals: {
      freight: order.freightCost,
      insurance: order.insuranceCost,
      grandTotal: order.grandTotal,
      amountInWords: getAmountInWords(order.grandTotal),
    },
    declaration: INVOICE_DECLARATION,
    signature: {
      company: companyProfile?.companyName || 'Exporter',
    },
  };
}
