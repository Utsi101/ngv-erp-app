/**
 * Buyer and buyer-related types
 */

export type Buyer = {
  id: string;
  companyName: string;
  contactPerson: string | null;
  billingAddress: string;
  shippingAddress: string;
  country: string;
  taxId: string | null;
  preferredCurrency: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Lightweight order data included in buyer queries */
export type OrderSummary = {
  id: string;
  grandTotal: number;
  status: string;
  createdAt: Date;
};

/** Buyer with associated order summaries (used in buyer directory & order builder) */
export type BuyerWithOrders = Buyer & {
  orders: OrderSummary[];
};
