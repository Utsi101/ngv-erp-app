export default function BuyersLoading() {
  return (
    <div className="p-4 max-w-6xl space-y-4">
      <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}
