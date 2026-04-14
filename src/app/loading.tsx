import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function DashboardLoading() {
  return (
    <div className="p-4 max-w-6xl justify-self-center w-full">
      <div className="mb-4">
        <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        <div className="h-3 w-48 bg-muted animate-pulse rounded mt-1.5" />
      </div>
      <div className="space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                <div className="h-3.5 w-3.5 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="h-7 w-20 bg-muted animate-pulse rounded mt-1" />
                <div className="h-2.5 w-36 bg-muted animate-pulse rounded mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="px-4 pt-3 pb-2">
            <div className="h-3.5 w-28 bg-muted animate-pulse rounded" />
          </CardHeader>
          <Separator />
          <CardContent className="px-0 pb-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2 border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
