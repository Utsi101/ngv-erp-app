import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function BuyersLoading() {
  return (
    <div className="p-4 max-w-7xl justify-self-center w-full">
      <div className="mb-4">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        <div className="h-3 w-64 bg-muted animate-pulse rounded mt-1.5" />
      </div>
      <div className="space-y-3">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="px-4 pt-3 pb-2">
                <div className="flex items-start justify-between">
                  <div className="h-3.5 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-10 bg-muted animate-pulse rounded-full" />
                </div>
                <div className="h-2.5 w-24 bg-muted animate-pulse rounded mt-1" />
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-2">
                <div className="h-2.5 w-full bg-muted animate-pulse rounded" />
                <div className="h-2.5 w-3/4 bg-muted animate-pulse rounded" />
                <div className="flex items-center justify-between mt-2">
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
