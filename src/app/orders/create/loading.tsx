import { Card, CardContent } from '@/components/ui/card';

export default function CreateOrderLoading() {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-1/4 mx-auto animate-pulse"></div>
          <div className="h-3 bg-muted rounded w-1/3 mx-auto animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}
