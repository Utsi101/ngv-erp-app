/**
 * Shared order types used across web and PDF renderers
 */

export type CompanyProfile = {
  id: string;
  companyName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  iecCode: string;
  pan: string;
  lutNumber: string | null;
  llpin: string | null;
  adCode: string;
  bankName: string;
  bankBranch: string;
  bankAddress: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  ifscCode: string;
  email: string;
  phone: string;
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  buyer: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    companyName: string;
    contactPerson: string | null;
    billingAddress: string;
    shippingAddress: string;
    country: string;
    taxId: string | null;
    preferredCurrency: string;
  };
  items: {
    id: string;
    quantity: number;
    historicalDescription: string;
    historicalHsCode: string;
    historicalUnitPrice: number;
    historicalNetWeight: number;
    historicalGrossWeight: number;
    skuFull?: string;
    lineTotal: number;
  }[];
};
