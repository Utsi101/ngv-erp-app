'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';
import { formatUSD } from '@/lib/format';

type OrderWithBuyer = {
  id: string;
  documentNumber: string;
  status: string;
  incoterm: string;
  vesselName: string | null;
  subTotal: number;
  freightCost: number;
  grandTotal: number;
  appliedLutNumber: string | null;
  createdAt: Date;
  buyer: {
    companyName: string;
    country: string;
  };
  items: {
    id: string;
    quantity: number;
    historicalDescription: string;
    historicalUnitPrice: number;
    lineTotal: number;
  }[];
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Draft', variant: 'outline' },
  PROFORMA_SENT: { label: 'Proforma', variant: 'secondary' },
  ADVANCE_RECEIVED: { label: 'Advance Rcvd', variant: 'default' },
  IN_PRODUCTION: { label: 'Production', variant: 'default' },
  READY_FOR_DISPATCH: { label: 'Ready', variant: 'default' },
  SHIPPED: { label: 'Shipped', variant: 'default' },
  PAYMENT_REALIZED: { label: 'Paid', variant: 'secondary' },
  REGULATORY_CLOSED: { label: 'Closed', variant: 'secondary' },
};

export function InvoiceList({ orders }: { orders: OrderWithBuyer[] }) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-xs text-muted-foreground">No invoices created yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="text-xs font-medium flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          Invoice History
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider">Invoice #</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Buyer</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Incoterm</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Vessel</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">LUT</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right">Items</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right">Grand Total</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="text-xs font-mono font-medium">{order.documentNumber}</TableCell>
                <TableCell className="text-xs">
                  {order.buyer.companyName}
                  <span className="text-muted-foreground ml-1 text-[10px]">({order.buyer.country})</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {order.incoterm}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{order.vesselName || '—'}</TableCell>
                <TableCell className="text-[10px] font-mono text-muted-foreground">
                  {order.appliedLutNumber || '—'}
                </TableCell>
                <TableCell className="text-xs text-right tabular-nums">{order.items.length}</TableCell>
                <TableCell className="text-xs font-mono text-right tabular-nums font-medium">
                  {formatUSD(order.grandTotal)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusLabels[order.status]?.variant ?? 'outline'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {statusLabels[order.status]?.label ?? order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[10px] text-muted-foreground tabular-nums">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
