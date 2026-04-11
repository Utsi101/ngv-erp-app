export default function InvoicesLoading() {
  return (
    <div className="p-4 max-w-5xl space-y-4">
      <div className="h-6 w-40 bg-muted animate-pulse rounded" />
      <div className="h-4 w-56 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-3">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-8 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-8 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="h-48 bg-muted animate-pulse rounded mt-4" />
    </div>
  );
}
