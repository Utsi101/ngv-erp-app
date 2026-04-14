export default function InventoryLoading() {
  return (
    <div className="p-4 max-w-7xl justify-self-center w-full">
      <div className="mb-4">
        <div className="h-5 w-44 bg-muted animate-pulse rounded" />
        <div className="h-3 w-52 bg-muted animate-pulse rounded mt-1.5" />
      </div>
      <div className="space-y-3">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-8 w-28 bg-muted animate-pulse rounded" />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="border-b px-4 py-2.5 flex gap-4">
            <div className="h-2.5 w-8 bg-muted animate-pulse rounded" />
            <div className="h-2.5 w-16 bg-muted animate-pulse rounded" />
            <div className="h-2.5 w-24 bg-muted animate-pulse rounded" />
            <div className="h-2.5 w-16 bg-muted animate-pulse rounded" />
            <div className="h-2.5 w-16 bg-muted animate-pulse rounded ml-auto" />
            <div className="h-2.5 w-14 bg-muted animate-pulse rounded" />
            <div className="h-2.5 w-14 bg-muted animate-pulse rounded" />
            <div className="h-2.5 w-14 bg-muted animate-pulse rounded" />
            <div className="h-2.5 w-12 bg-muted animate-pulse rounded" />
          </div>
          {/* Table rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b last:border-b-0 px-4 py-3 flex gap-4 items-center">
              <div className="h-3 w-4 bg-muted animate-pulse rounded" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              <div className="h-3 w-36 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-14 bg-muted animate-pulse rounded ml-auto" />
              <div className="h-3 w-12 bg-muted animate-pulse rounded" />
              <div className="h-3 w-12 bg-muted animate-pulse rounded" />
              <div className="h-3 w-6 bg-muted animate-pulse rounded" />
              <div className="h-6 w-12 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
