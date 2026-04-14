import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function OrdersLoading() {
  return (
    <div className="p-4 max-w-7xl justify-self-center w-full">
      <Card>
        {/* Header: title + button */}
        <CardHeader className="px-4 pt-3 pb-2 flex flex-row items-center justify-between space-y-0">
          <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
          <div className="h-7 w-24 bg-muted rounded animate-pulse" />
        </CardHeader>
        <Separator />
        <CardContent className="px-0 pb-0">
          {/* Table header */}
          <div className="border-b px-4 py-2 grid grid-cols-9 gap-2">
            {['w-16', 'w-24', 'w-14', 'w-20', 'w-28', 'w-10', 'w-20', 'w-16', 'w-16'].map(
              (w, i) => (
                <div key={i} className={`h-2.5 ${w} bg-muted rounded animate-pulse`} />
              )
            )}
          </div>
          {/* Table rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border-b last:border-b-0 px-4 py-3 grid grid-cols-9 gap-2 items-center"
            >
              <div className="h-3 w-14 bg-muted rounded animate-pulse" />
              <div className="h-3 w-28 bg-muted rounded animate-pulse" />
              <div className="h-3 w-10 bg-muted rounded animate-pulse" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-6 bg-muted rounded animate-pulse ml-auto" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse ml-auto" />
              <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
