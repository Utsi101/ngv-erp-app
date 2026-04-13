import { Badge } from '@/components/ui/badge';
import { formatUSD } from '@/lib/format';
import { STATUS_LABELS } from '@/lib/status-labels';
import type { OrderWithBuyer } from '@/types';

export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_LABELS[status];
  return (
    <Badge variant={config?.variant ?? 'outline'} className="text-[10px] px-1.5 py-0">
      {config?.label ?? status}
    </Badge>
  );
}

export function OrderRow({ order }: { order: OrderWithBuyer }) {
  return (
    <>
      <td className="text-xs font-mono font-medium px-4 py-2">{order.documentNumber}</td>
      <td className="text-xs px-4 py-2">
        {order.buyer.companyName}
        <span className="text-muted-foreground ml-1 text-[10px]">({order.buyer.country})</span>
      </td>
      <td className="px-4 py-2">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {order.incoterm}
        </Badge>
      </td>
      <td className="text-xs text-muted-foreground px-4 py-2">{order.vesselName || '—'}</td>
      <td className="text-[10px] font-mono text-muted-foreground px-4 py-2">
        {order.appliedLutNumber || '—'}
      </td>
      <td className="text-xs text-right tabular-nums px-4 py-2">{order.items.length}</td>
      <td className="text-xs font-mono text-right tabular-nums font-medium px-4 py-2">
        {formatUSD(order.grandTotal)}
      </td>
      <td className="px-4 py-2">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="text-[10px] text-muted-foreground tabular-nums px-4 py-2">
        {new Date(order.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </td>
    </>
  );
}
