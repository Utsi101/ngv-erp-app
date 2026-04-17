import { OrderTable } from '@/components/orders/order-table';
import { db } from '@/prisma/db';

export default async function OrdersPage() {
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
