import { OrderTable } from '@/components/orders/order-table';
import { db } from '@/lib/db';
import { Suspense } from 'react';

async function OrdersPageContent() {
  const [orders, companyProfile] = await Promise.all([
    db.order.findMany({
      include: {
        buyer: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.companyProfile.findFirst(),
  ]);

  return (
    <div className="p-4 max-w-7xl justify-self-center w-full">
      <OrderTable orders={orders} companyProfile={companyProfile} />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading orders...</div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
