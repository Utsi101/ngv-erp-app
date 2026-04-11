'use server';

import { db } from '@/lib/db';

export async function getBuyers() {
  try {
    const buyers = await db.buyer.findMany({
      include: { orders: { select: { id: true, grandTotal: true, status: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true as const, data: buyers };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to fetch buyers' };
  }
}

export async function createBuyer(data: {
  companyName: string;
  contactPerson?: string;
  billingAddress: string;
  shippingAddress: string;
  country: string;
  taxId?: string;
  preferredCurrency?: string;
}) {
  try {
    const buyer = await db.buyer.create({ data });
    return { success: true as const, data: buyer };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to create buyer' };
  }
}
