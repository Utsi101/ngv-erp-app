'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Globe, FileText } from 'lucide-react';
import { formatUSD } from '@/lib/format';
import { createBuyer } from '@/app/actions/buyers';
import { useRouter } from 'next/navigation';

type OrderSummary = {
  id: string;
  grandTotal: number;
  status: string;
  createdAt: Date;
};

type Buyer = {
  id: string;
  companyName: string;
  contactPerson: string | null;
  billingAddress: string;
  shippingAddress: string;
  country: string;
  taxId: string | null;
  preferredCurrency: string;
  createdAt: Date;
  updatedAt: Date;
  orders: OrderSummary[];
};

const statusColors: Record<string, 'default' | 'secondary' | 'outline'> = {
  DRAFT: 'outline',
  PROFORMA_SENT: 'secondary',
  SHIPPED: 'default',
  PAYMENT_REALIZED: 'secondary',
};

export function BuyerDirectory({ buyers }: { buyers: Buyer[] }) {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = buyers.filter(
    (b) =>
      b.companyName.toLowerCase().includes(search.toLowerCase()) ||
      b.country.toLowerCase().includes(search.toLowerCase()) ||
      (b.taxId?.includes(search) ?? false)
  );

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createBuyer({
        companyName: formData.get('companyName') as string,
        contactPerson: (formData.get('contactPerson') as string) || undefined,
        billingAddress: formData.get('billingAddress') as string,
        shippingAddress: formData.get('shippingAddress') as string,
        country: formData.get('country') as string,
        taxId: (formData.get('taxId') as string) || undefined,
        preferredCurrency: (formData.get('preferredCurrency') as string) || 'USD',
      });
      setDialogOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search company, country, tax ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="h-8 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Add Buyer
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">New Buyer</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Company Name</Label>
                  <Input name="companyName" required className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Contact Person</Label>
                  <Input name="contactPerson" className="h-8 text-xs mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Country</Label>
                  <Input name="country" required className="h-8 text-xs mt-1" placeholder="US" />
                </div>
                <div>
                  <Label className="text-xs">Tax ID / VAT</Label>
                  <Input name="taxId" className="h-8 text-xs mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Billing Address</Label>
                <Textarea name="billingAddress" required className="text-xs mt-1 min-h-[60px]" />
              </div>
              <div>
                <Label className="text-xs">Shipping Address</Label>
                <Textarea name="shippingAddress" required className="text-xs mt-1 min-h-[60px]" />
              </div>
              <div>
                <Label className="text-xs">Preferred Currency</Label>
                <Input name="preferredCurrency" defaultValue="USD" className="h-8 text-xs mt-1" />
              </div>
              <Button type="submit" size="sm" className="w-full h-8 text-xs" disabled={isPending}>
                {isPending ? 'Creating...' : 'Add Buyer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-12">No buyers found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((buyer) => {
            const totalRevenue = buyer.orders.reduce((s, o) => s + o.grandTotal, 0);
            return (
              <Card key={buyer.id} className="overflow-hidden">
                <CardHeader className="px-4 pt-3 pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xs font-semibold leading-tight">
                      {buyer.companyName}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                      <Globe className="h-2.5 w-2.5 mr-1" />
                      {buyer.country}
                    </Badge>
                  </div>
                  {buyer.contactPerson && (
                    <p className="text-[10px] text-muted-foreground">{buyer.contactPerson}</p>
                  )}
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground block">Tax ID</span>
                      <span className="font-mono">{buyer.taxId || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Currency</span>
                      <span className="font-mono">{buyer.preferredCurrency}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Orders</span>
                      <span className="font-mono">{buyer.orders.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Revenue</span>
                      <span className="font-mono">{formatUSD(totalRevenue)}</span>
                    </div>
                  </div>

                  {buyer.orders.length > 0 && (
                    <div className="border-t pt-2 space-y-1">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <FileText className="h-2.5 w-2.5" />
                        Recent Orders
                      </p>
                      {buyer.orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between text-[10px]"
                        >
                          <Badge
                            variant={statusColors[order.status] ?? 'outline'}
                            className="text-[9px] px-1 py-0"
                          >
                            {order.status.replace(/_/g, ' ')}
                          </Badge>
                          <span className="font-mono tabular-nums">
                            {formatUSD(order.grandTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        Showing {filtered.length} of {buyers.length} buyers
      </p>
    </div>
  );
}
