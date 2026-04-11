'use server';

import { db } from '@/lib/db';

export async function getProducts() {
  try {
    const products = await db.product.findMany({
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, data: products };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: 'Failed to fetch inventory' };
  }
}
