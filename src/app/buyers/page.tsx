import { Suspense } from 'react';
import { getBuyers } from '@/app/actions/buyers';
import { BuyerDirectory } from './buyer-directory';

async function BuyerData() {
  const result = await getBuyers();

  if (!result.success) {
    return <p className="text-xs text-destructive">Failed to load buyers.</p>;
  }

  return <BuyerDirectory buyers={result.data} />;
}

export default function BuyersPage() {
  return (
    <div className="p-4 max-w-6xl">
      <div className="mb-4">
        <h1 className="text-base font-semibold">Buyer CRM</h1>
        <p className="text-xs text-muted-foreground">International buyer directory and order history</p>
      </div>
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      }>
        <BuyerData />
      </Suspense>
    </div>
  );
}
