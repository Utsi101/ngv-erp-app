import { Suspense } from 'react';
import { getBuyers } from '@/app/actions/buyers';
import { getProducts } from '@/app/actions/inventory';
import { getOrders } from '@/app/actions/orders';
import { InvoiceBuilder } from './invoice-builder';
import { InvoiceList } from './invoice-list';
import { Separator } from '@/components/ui/separator';

async function InvoicePageContent() {
  const [buyersResult, productsResult, ordersResult] = await Promise.all([
    getBuyers(),
    getProducts(),
    getOrders(),
  ]);

  if (!buyersResult.success || !productsResult.success || !ordersResult.success) {
    return <p className="text-xs text-destructive">Failed to load data.</p>;
  }

  return (
    <div className="space-y-6">
      <InvoiceBuilder buyers={buyersResult.data} products={productsResult.data} />
      <Separator />
      <InvoiceList orders={ordersResult.data} />
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <div className="p-4 max-w-6xl">
      <div className="mb-4">
        <h1 className="text-base font-semibold">Invoice Builder</h1>
        <p className="text-xs text-muted-foreground">
          Create export invoices with snapshot pricing
        </p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted animate-pulse rounded" />
              ))}
            </div>
            <div className="h-48 bg-muted animate-pulse rounded" />
          </div>
        }
      >
        <InvoicePageContent />
      </Suspense>
    </div>
  );
}
