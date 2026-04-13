'use client';

import { convertUsdToWords } from '@/lib/currency-to-words';
import { formatOrderDate, safeValue } from '@/lib/order-utils';
import type { CompanyProfile, OrderWithBuyer } from '@/types/order';

export interface OrderContent {
  header: {
    exporter: {
      name: string;
      address1: string;
      address2: string | null;
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
  lineItems: {
    id: string;
    skuFull: string;
    quantity: number;
    description: string;
    hsCode: string;
    netWeight: number;
    grossWeight: number;
    unitPrice: number;
    lineTotal: number;
  }[];
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

const ORDER_DECLARATION =
  'We certify that the invoice is true and correct and represents the actual transaction relating to the goods described above. The goods are of the country/countries of origin indicated and the trade terms are indicated above.';

export function useOrderContent(
  order: OrderWithBuyer,
  companyProfile: CompanyProfile | null
): OrderContent {
  if (!companyProfile) {
    throw new Error('Company profile is required');
  }

  // Convert amount to words
  const getAmountInWords = (amount: number): string => {
    try {
      return convertUsdToWords(amount);
    } catch (e) {
      return 'Unable to convert amount';
    }
  };

  const content: OrderContent = {
    header: {
      exporter: {
        name: companyProfile.companyName,
        address1: companyProfile.addressLine1,
        address2: companyProfile.addressLine2,
        gstin: companyProfile.gstin,
        iec: companyProfile.iecCode,
        pan: companyProfile.pan,
        adCode: companyProfile.adCode,
      },
      invoiceDetails: {
        number: order.documentNumber,
        date: formatOrderDate(order.createdAt),
        contractNumber: order.id.substring(0, 8).toUpperCase(),
      },
      complianceIds: {
        iecCode: companyProfile.iecCode,
        origin: 'INDIA',
        destination: order.buyer.country || 'N/A',
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
        incoterm: safeValue(order.incoterm),
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
    declaration: ORDER_DECLARATION,
    signature: {
      company: companyProfile.companyName,
    },
  };

  return content;
}
