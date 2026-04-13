import { getDashboardStats } from '@/app/actions/orders';
import { OrderStatusBadge } from '@/components/orders/order-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatUSD } from '@/lib/format';
import { Clock, DollarSign, Package, Ship } from 'lucide-react';
import { Suspense } from 'react';

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-muted animate-pulse" />
    </div>
  );
}

async function DashboardContent() {
  const result = await getDashboardStats();

  if (!result.success) {
    return <p className="text-xs text-destructive">Failed to load dashboard data.</p>;
  }

  const { activeShipments, totalOutstanding, inventoryCount, recentOrders } = result.data;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Shipments
            </CardTitle>
            <Ship className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold tabular-nums">{activeShipments}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              In production, ready, or shipped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Outstanding Payments
            </CardTitle>
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold tabular-nums">{formatUSD(totalOutstanding)}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Across all unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Inventory Products
            </CardTitle>
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold tabular-nums">{inventoryCount}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Unique product SKUs</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="px-4 pt-3 pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="px-0 pb-0">
          {recentOrders.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-medium">{order.documentNumber}</span>
                    <span className="text-xs text-muted-foreground">{order.buyer.companyName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono tabular-nums">
                      {formatUSD(order.grandTotal)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-4 max-w-6xl justify-self-center w-full">
      <div className="mb-4">
        <h1 className="text-base font-semibold">Executive Dashboard</h1>
        <p className="text-xs text-muted-foreground">Export operations overview</p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
