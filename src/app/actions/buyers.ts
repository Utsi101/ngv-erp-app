'use server';

import { db } from '@/lib/db';
import type { CreateBuyerInput } from '@/types';

export async function getBuyers() {
  try {
    const buyers = await db.buyer.findMany({
      include: {
        orders: { select: { id: true, grandTotal: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true as const, data: buyers };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to fetch buyers' };
  }
}

export async function createBuyer(data: CreateBuyerInput) {
  try {
    const buyer = await db.buyer.create({ data });
    return { success: true as const, data: buyer };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to create buyer' };
  }
}
