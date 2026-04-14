import { getProductsWithVariants } from '@/app/actions/inventory';
import { InventoryTable } from '@/components/inventory/inventoryTable';

export default async function InventoryPage() {
  const result = await getProductsWithVariants();

  if (!result.success) {
    return <p className="text-xs text-destructive">Failed to load inventory.</p>;
  }

  return (
    <div className="p-4 max-w-7xl justify-self-center w-full">
      <div className="mb-4">
        <h1 className="text-base font-semibold">Inventory Management</h1>
        <p className="text-xs text-muted-foreground">Products, variants, and stock levels</p>
      </div>
      <InventoryTable products={result.data} />
    </div>
  );
}
