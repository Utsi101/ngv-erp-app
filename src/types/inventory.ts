/**
 * Product and variant types
 */

export type ProductVariant = {
  id: string;
  skuFull: string;
  color: string | null;
  leatherType: string | null;
  stockAllocation: number;
};

/** Variant with linked order item IDs (used in inventory table) */
export type ProductVariantWithOrderItems = ProductVariant & {
  orderItems: { id: string }[];
};

export type Product = {
  id: string;
  skuBase: string;
  description: string;
  hsCode: string;
  unitPriceUsd: number;
  moq: number;
  weightNet: number;
  weightGross: number;
  cbm: number;
  createdAt: Date;
  variants: ProductVariant[];
};

/** Product with variant order-item data (used in inventory table) */
export type ProductWithVariantOrderItems = Omit<Product, 'variants'> & {
  variants: ProductVariantWithOrderItems[];
};
