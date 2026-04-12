export default function ProfileLoading() {
  return (
    <div className="p-4 max-w-2xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        <div className="h-4 w-56 bg-muted animate-pulse rounded" />
      </div>

      {/* Form Sections */}
      {Array.from({ length: 4 }).map((_, sectionIdx) => (
        <div key={sectionIdx} className="space-y-3">
          {/* Section Title */}
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, fieldIdx) => (
              <div key={fieldIdx} className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
