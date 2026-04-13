import { getProductsWithVariants } from '@/app/actions/inventory';
import { Suspense } from 'react';
import { InventoryTable } from '../../components/inventory/inventoryTable';

async function InventoryData() {
  const result = await getProductsWithVariants();

  if (!result.success) {
    return <p className="text-xs text-destructive">Failed to load inventory.</p>;
  }

  return <InventoryTable products={result.data} />;
}

export default function InventoryPage() {
  return (
    <div className="p-4 max-w-7xl justify-self-center w-full">
      <div className="mb-4">
        <h1 className="text-base font-semibold">Inventory Management</h1>
        <p className="text-xs text-muted-foreground">Products, variants, and stock levels</p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        }
      >
        <InventoryData />
      </Suspense>
    </div>
  );
}
