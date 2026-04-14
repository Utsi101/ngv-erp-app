import { getBuyers } from '@/app/actions/buyers';
import { BuyerDirectory } from '@/components/buyers/buyerDirectory';

export default async function BuyersPage() {
  const result = await getBuyers();

  if (!result.success) {
    return <p className="text-xs text-destructive">Failed to load buyers.</p>;
  }

  return (
    <div className="p-4 max-w-7xl justify-self-center w-full">
      <div className="mb-4">
        <h1 className="text-base font-semibold">Buyer CRM</h1>
        <p className="text-xs text-muted-foreground">
          International buyer directory and order history
        </p>
      </div>
      <BuyerDirectory buyers={result.data} />
    </div>
  );
}
