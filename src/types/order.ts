/**
 * Order types used across web and PDF renderers
 */

import type { Buyer } from './buyer';

// ── Enums ──────────────────────────────────────────────

export type Incoterm = 'EXW' | 'FOB' | 'CIF' | 'DAP';

export type OrderStatus =
  | 'DRAFT'
  | 'PROFORMA_SENT'
  | 'ADVANCE_RECEIVED'
  | 'IN_PRODUCTION'
  | 'READY_FOR_DISPATCH'
  | 'SHIPPED'
  | 'PAYMENT_REALIZED'
  | 'REGULATORY_CLOSED';

export type StatusConfig = {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
};

// ── Order entities ─────────────────────────────────────

export type OrderItem = {
  id: string;
  quantity: number;
  historicalDescription: string;
  historicalHsCode: string;
  historicalUnitPrice: number;
  historicalNetWeight: number;
  historicalGrossWeight: number;
  skuFull: string;
  lineTotal: number;
};

export type OrderWithBuyer = {
  id: string;
  documentNumber: string;
  status: string;
  incoterm: string;
  portOfLoading: string | null;
  portOfDischarge: string | null;
  vesselName: string | null;
  subTotal: number;
  freightCost: number;
  insuranceCost: number;
  grandTotal: number;
  appliedLutNumber: string | null;
  createdAt: Date;
  buyer: Buyer;
  items: OrderItem[];
};

// ── Action input types ─────────────────────────────────

export type CreateOrderInput = {
  buyerId: string;
  incoterm: Incoterm;
  portOfLoading?: string;
  portOfDischarge?: string;
  vesselName?: string;
  appliedLutNumber?: string;
  freightCost: number;
  insuranceCost: number;
  items: {
    variantId: string;
    quantity: number;
  }[];
};

/** Form values for the order builder — all fields required (empty string for "none") */
export type OrderFormValues = Required<CreateOrderInput>;

// ── Order content (shared between modal & PDF) ────────

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
