import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function FieldSkeleton({ className = 'w-full' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
      <div className="h-8 w-full bg-muted rounded animate-pulse mt-1" />
    </div>
  );
}

export default function CreateOrderLoading() {
  return (
    <div className="p-4 max-w-7xl justify-self-center w-full">
      <Card>
        {/* Header */}
        <CardHeader className="px-4 pt-3 pb-2">
          <div className="h-3.5 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <Separator />
        <CardContent className="px-4 pt-4 pb-4 space-y-4">
          {/* Row 1: Buyer, Incoterm, LUT */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <FieldSkeleton />
            </div>
            <FieldSkeleton />
            <FieldSkeleton />
          </div>

          {/* Row 2: Logistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <div />
          </div>

          <Separator />

          {/* Line Items header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-7 w-20 bg-muted rounded animate-pulse" />
            </div>
            {/* Empty items placeholder */}
            <div className="border rounded-md py-6 flex items-center justify-center">
              <div className="h-3 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <FieldSkeleton />
            <FieldSkeleton />
            <div className="col-span-2 space-y-1.5">
              {['w-32', 'w-28', 'w-28', 'w-36'].map((w, i) => (
                <div key={i} className="flex justify-end">
                  <div className={`h-3 ${w} bg-muted rounded animate-pulse`} />
                </div>
              ))}
            </div>
          </div>

          {/* Submit area */}
          <div className="flex items-center justify-end pt-2">
            <div className="h-8 w-28 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
