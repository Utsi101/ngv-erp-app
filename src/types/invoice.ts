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
