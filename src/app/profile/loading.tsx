import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function FieldSkeleton() {
  return (
    <div>
      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
      <div className="h-8 w-full bg-muted animate-pulse rounded mt-1" />
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <div className="p-4 max-w-7xl justify-self-center w-full">
      <div className="mb-6">
        <div className="h-7 w-40 bg-muted animate-pulse rounded" />
        <div className="h-4 w-72 bg-muted animate-pulse rounded mt-1.5" />
      </div>

      <Card>
        <CardHeader>
          <div className="h-5 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Identity */}
          <div>
            <div className="h-4 w-32 bg-muted animate-pulse rounded mb-4" />
            <div className="space-y-3">
              <FieldSkeleton />
              <div className="grid grid-cols-2 gap-3">
                <FieldSkeleton />
                <FieldSkeleton />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <FieldSkeleton />
                <FieldSkeleton />
                <FieldSkeleton />
                <FieldSkeleton />
              </div>
              <FieldSkeleton />
            </div>
          </div>

          <Separator />

          {/* Tax & Trade */}
          <div>
            <div className="h-4 w-36 bg-muted animate-pulse rounded mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <FieldSkeleton key={i} />
              ))}
            </div>
          </div>

          <Separator />

          {/* Banking */}
          <div>
            <div className="h-4 w-40 bg-muted animate-pulse rounded mb-4" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FieldSkeleton />
                <FieldSkeleton />
              </div>
              <FieldSkeleton />
              <div className="grid grid-cols-2 gap-3">
                <FieldSkeleton />
                <FieldSkeleton />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldSkeleton />
                <FieldSkeleton />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact */}
          <div>
            <div className="h-4 w-40 bg-muted animate-pulse rounded mb-4" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FieldSkeleton />
                <FieldSkeleton />
              </div>
              <FieldSkeleton />
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between gap-2 pt-4">
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-28 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
