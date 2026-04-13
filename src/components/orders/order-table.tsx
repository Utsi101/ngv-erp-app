import { OrderTableBody } from '@/components/orders/order-table-body';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CompanyProfile, OrderWithBuyer } from '@/types';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';

export function OrderTable({
  orders,
  companyProfile,
}: {
  orders: OrderWithBuyer[];
  companyProfile: CompanyProfile | null;
}) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-xs text-muted-foreground">No orders created yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 pt-3 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-medium flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          Order History
        </CardTitle>
        <Link href="/orders/create">
          <Button size="sm" className="h-7 text-[11px]">
            <Plus className="h-3 w-3 mr-1" />
            New Order
          </Button>
        </Link>
      </CardHeader>
      <Separator />
      <CardContent className="px-0 pb-0">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-[10px] uppercase tracking-wider text-left font-medium text-muted-foreground px-4 py-2">
                Order #
              </th>
              <th className="text-[10px] uppercase tracking-wider text-left font-medium text-muted-foreground px-4 py-2">
                Buyer
              </th>
              <th className="text-[10px] uppercase tracking-wider text-left font-medium text-muted-foreground px-4 py-2">
                Incoterm
              </th>
              <th className="text-[10px] uppercase tracking-wider text-left font-medium text-muted-foreground px-4 py-2">
                Vessel
              </th>
              <th className="text-[10px] uppercase tracking-wider text-left font-medium text-muted-foreground px-4 py-2">
                LUT
              </th>
              <th className="text-[10px] uppercase tracking-wider text-right font-medium text-muted-foreground px-4 py-2">
                Items
              </th>
              <th className="text-[10px] uppercase tracking-wider text-right font-medium text-muted-foreground px-4 py-2">
                Grand Total
              </th>
              <th className="text-[10px] uppercase tracking-wider text-left font-medium text-muted-foreground px-4 py-2">
                Status
              </th>
              <th className="text-[10px] uppercase tracking-wider text-left font-medium text-muted-foreground px-4 py-2">
                Date
              </th>
            </tr>
          </thead>
          <OrderTableBody orders={orders} companyProfile={companyProfile} />
        </table>
      </CardContent>
    </Card>
  );
}
