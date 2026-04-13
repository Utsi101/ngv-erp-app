'use server';

import { db } from '@/lib/db';
import type { CreateOrderInput } from '@/types';

export async function getOrders() {
  try {
    const orders = await db.order.findMany({
      include: {
        buyer: true,
        items: { include: { variant: { include: { product: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true as const, data: orders };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to fetch orders' };
  }
}

export async function getDashboardStats() {
  try {
    const [activeShipments, totalOutstanding, inventoryCount, recentOrders] = await Promise.all([
      db.order.count({
        where: { status: { in: ['SHIPPED', 'READY_FOR_DISPATCH', 'IN_PRODUCTION'] } },
      }),
      db.order.aggregate({
        where: { status: { notIn: ['PAYMENT_REALIZED', 'REGULATORY_CLOSED'] } },
        _sum: { grandTotal: true },
      }),
      db.product.count(),
      db.order.findMany({
        take: 5,
        include: { buyer: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      success: true as const,
      data: {
        activeShipments,
        totalOutstanding: totalOutstanding._sum.grandTotal ?? 0,
        inventoryCount,
        recentOrders,
      },
    };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to fetch dashboard stats' };
  }
}

export async function createOrder(data: CreateOrderInput) {
  try {
    // Fetch all variants with their product data for snapshot
    const variantIds = data.items.map((i) => i.variantId);
    const variants = await db.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Build line items with snapshot data
    const lineItems = data.items.map((item) => {
      const variant = variantMap.get(item.variantId);
      if (!variant) throw new Error(`Variant ${item.variantId} not found`);

      const lineTotal = variant.product.unitPriceUsd * item.quantity;

      return {
        variantId: item.variantId,
        skuFull: variant.skuFull,
        quantity: item.quantity,
        historicalUnitPrice: variant.product.unitPriceUsd,
        historicalDescription: variant.product.description,
        historicalHsCode: variant.product.hsCode,
        historicalNetWeight: variant.product.weightNet,
        historicalGrossWeight: variant.product.weightGross,
        historicalCbm: variant.product.cbm,
        lineTotal,
      };
    });

    const subTotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
    const grandTotal = subTotal + data.freightCost + data.insuranceCost;

    // Generate document number
    const year = new Date().getFullYear();
    const orderCount = await db.order.count();
    const documentNumber = `INV-${year}-${String(orderCount + 1).padStart(4, '0')}`;

    const order = await db.order.create({
      data: {
        documentNumber,
        buyerId: data.buyerId,
        incoterm: data.incoterm,
        portOfLoading: data.portOfLoading,
        portOfDischarge: data.portOfDischarge,
        vesselName: data.vesselName,
        appliedLutNumber: data.appliedLutNumber,
        subTotal,
        freightCost: data.freightCost,
        insuranceCost: data.insuranceCost,
        grandTotal,
        items: { create: lineItems },
      },
      include: { buyer: true, items: true },
    });

    return { success: true as const, data: order };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to create invoice' };
  }
}
