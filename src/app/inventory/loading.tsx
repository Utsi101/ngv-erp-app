export default function InventoryLoading() {
  return (
    <div className="p-4 max-w-6xl space-y-4">
      <div className="h-6 w-48 bg-muted animate-pulse rounded" />
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      <div className="h-10 w-64 bg-muted animate-pulse rounded mt-4" />
      <div className="space-y-2 mt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}
