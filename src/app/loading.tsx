export default function DashboardLoading() {
  return (
    <div className="p-4 max-w-6xl space-y-4">
      <div className="h-6 w-48 bg-muted animate-pulse rounded" />
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-muted animate-pulse" />
    </div>
  );
}
