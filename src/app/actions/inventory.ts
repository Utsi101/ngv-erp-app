'use server';

import { db } from '@/lib/db';
import type { CreateProductInput, CreateVariantInput, EditProductInput } from '@/types';

export async function getProducts() {
  try {
    const products = await db.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true as const, data: products };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to fetch inventory' };
  }
}

export async function createProduct(data: CreateProductInput) {
  try {
    const product = await db.product.create({ data });
    return { success: true as const, data: product };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to create product' };
  }
}

export async function createVariant(data: CreateVariantInput) {
  try {
    const variant = await db.productVariant.create({ data });
    return { success: true as const, data: variant };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to create variant' };
  }
}

export async function getProductsWithVariants() {
  try {
    const products = await db.product.findMany({
      include: { variants: { include: { orderItems: { select: { id: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true as const, data: products };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to fetch inventory' };
  }
}

export async function editProduct(id: string, data: EditProductInput) {
  try {
    const product = await db.product.update({
      where: { id },
      data,
    });
    return { success: true as const, data: product };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to update product' };
  }
}
