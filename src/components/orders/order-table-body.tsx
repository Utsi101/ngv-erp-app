'use client';

import { OrderRow } from '@/components/orders/order-row';
import type { CompanyProfile, OrderWithBuyer } from '@/types';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const OrderModal = dynamic(
  () => import('@/components/orders/order-modal').then((m) => m.OrderModal),
  {
    ssr: false,
  }
);

export function OrderTableBody({
  orders,
  companyProfile,
}: {
  orders: OrderWithBuyer[];
  companyProfile: CompanyProfile | null;
}) {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithBuyer | null>(null);

  return (
    <>
      <tbody>
        {orders.map((order) => (
          <tr
            key={order.id}
            className="cursor-pointer hover:bg-muted/50 border-b transition-colors"
            onClick={() => setSelectedOrder(order)}
          >
            <OrderRow order={order} />
          </tr>
        ))}
      </tbody>

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          companyProfile={companyProfile}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}
