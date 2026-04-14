import { getBuyers } from '@/app/actions/buyers';
import { getProducts } from '@/app/actions/inventory';
import { getCompanyProfile } from '@/app/actions/profile';
import { OrderBuilder } from '@/components/orders/order-builder';

export default async function CreateOrderPage() {
  const [buyersResult, productsResult, profileResult] = await Promise.all([
    getBuyers(),
    getProducts(),
    getCompanyProfile(),
  ]);

  const buyers = buyersResult.success ? buyersResult.data : [];
  const products = productsResult.success ? productsResult.data : [];
  const companyProfile = profileResult.success ? profileResult.data : null;

  return (
    <div className="p-4 max-w-7xl justify-self-center w-full">
      <OrderBuilder buyers={buyers} products={products} companyProfile={companyProfile} />
    </div>
  );
}
