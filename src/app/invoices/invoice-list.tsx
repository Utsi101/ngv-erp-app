'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatUSD } from '@/lib/format';
import { FileText, X } from 'lucide-react';
import { useState } from 'react';

type OrderWithBuyer = {
  id: string;
  documentNumber: string;
  status: string;
  incoterm: string;
  portOfLoading: string | null;
  portOfDischarge: string | null;
  vesselName: string | null;
  subTotal: number;
  freightCost: number;
  insuranceCost: number;
  grandTotal: number;
  appliedLutNumber: string | null;
  createdAt: Date;
  buyer: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    companyName: string;
    contactPerson: string | null;
    billingAddress: string;
    shippingAddress: string;
    country: string;
    taxId: string | null;
    preferredCurrency: string;
  };
  items: {
    id: string;
    quantity: number;
    historicalDescription: string;
    historicalHsCode: string;
    historicalUnitPrice: number;
    variantFullSku?: string;
    lineTotal: number;
  }[];
};

const statusLabels: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
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
  const [selectedOrder, setSelectedOrder] = useState<OrderWithBuyer | null>(null);

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
    <>
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
                <TableHead className="text-[10px] uppercase tracking-wider text-right">
                  Items
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-right">
                  Grand Total
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="text-xs font-mono font-medium">
                    {order.documentNumber}
                  </TableCell>
                  <TableCell className="text-xs">
                    {order.buyer.companyName}
                    <span className="text-muted-foreground ml-1 text-[10px]">
                      ({order.buyer.country})
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {order.incoterm}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {order.vesselName || '—'}
                  </TableCell>
                  <TableCell className="text-[10px] font-mono text-muted-foreground">
                    {order.appliedLutNumber || '—'}
                  </TableCell>
                  <TableCell className="text-xs text-right tabular-nums">
                    {order.items.length}
                  </TableCell>
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

      {/* Invoice Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {selectedOrder && (
            <div className="w-full">
              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-3 right-3 z-50 p-1.5 hover:bg-gray-100 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Invoice Content */}
              <div className="p-8 bg-white">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-center mb-2">COMMERCIAL INVOICE</h1>
                  <div className="grid grid-cols-3 gap-4 text-xs border border-black">
                    {/* Left Column - Exporter */}
                    <div className="p-3 border-r border-black">
                      <p className="font-bold mb-2">Exporter:</p>
                      <p className="font-semibold">RAJAGDHIRAJ TIRUPANI VINAYAK</p>
                      <p>NATARAJ PVT. LTD</p>
                      <p className="text-[11px] mt-2">Info: Contact for details</p>
                    </div>

                    {/* Middle Column - Invoice Details */}
                    <div className="p-3 border-r border-black">
                      <p className="font-bold mb-1">Invoice No. & Date:</p>
                      <p className="font-mono font-semibold">{selectedOrder.documentNumber}</p>
                      <p className="text-[10px]">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}
                      </p>
                      <p className="font-bold mt-3 mb-1">CONTRACT NO. & DATE</p>
                      <p className="text-[10px]">{selectedOrder.appliedLutNumber || 'N/A'}</p>
                    </div>

                    {/* Right Column - LE Code */}
                    <div className="p-3">
                      <p className="font-bold mb-1">LE CODE NO.</p>
                      <p className="text-[10px]">To be filled</p>
                    </div>
                  </div>
                </div>

                {/* Buyer & Shipping Info */}
                <div className="mb-6 text-xs border border-black">
                  <div className="grid grid-cols-2">
                    <div className="p-3 border-r border-black">
                      <p className="font-bold mb-1">Buyer:</p>
                      <p className="font-semibold text-[11px]">{selectedOrder.buyer.companyName}</p>
                      <p className="text-[10px] mt-1">{selectedOrder.buyer.billingAddress}</p>
                      <p className="text-[10px] mt-1">Country: {selectedOrder.buyer.country}</p>
                    </div>
                    <div className="p-3">
                      <p className="font-bold mb-2">Country of Origin: INDIA</p>
                      <p className="font-bold mt-3 mb-1">Country of Final Destination</p>
                      <p className="font-semibold">{selectedOrder.buyer.country}</p>
                    </div>
                  </div>

                  <div className="border-t border-black grid grid-cols-3">
                    <div className="p-3 border-r border-black">
                      <p className="font-bold mb-1">Vessel Name:</p>
                      <p className="text-[11px]">{selectedOrder.vesselName || 'TBD'}</p>
                    </div>
                    <div className="p-3 border-r border-black">
                      <p className="font-bold mb-1">Port of Loading:</p>
                      <p className="text-[11px]">{selectedOrder.portOfLoading || 'TBD'}</p>
                    </div>
                    <div className="p-3">
                      <p className="font-bold mb-1">Terms of Delivery:</p>
                      <p className="text-[11px]">{selectedOrder.incoterm}</p>
                    </div>
                  </div>

                  <div className="border-t border-black grid grid-cols-2">
                    <div className="p-3 border-r border-black">
                      <p className="font-bold mb-1">Port of Discharge:</p>
                      <p className="text-[11px]">{selectedOrder.portOfDischarge || 'TBD'}</p>
                    </div>
                    <div className="p-3">
                      <p className="font-bold mb-1">Final Destination:</p>
                      <p className="text-[11px]">{selectedOrder.buyer.country}</p>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="mb-6 border border-black text-xs">
                  <div className="grid grid-cols-6 border-b border-black font-bold bg-gray-50">
                    <div className="p-2 border-r border-black">SKU</div>
                    <div className="p-2 border-r border-black col-span-2">Description of Goods</div>
                    <div className="p-2 border-r border-black text-right">Qty</div>
                    <div className="p-2 border-r border-black text-right">Unit Price USD</div>
                    <div className="p-2 text-right">Total Amount USD</div>
                  </div>

                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-6 border-b border-black">
                      <div className="p-2 border-r border-black text-[10px] font-mono">
                        {item.variantFullSku || 'N/A'}
                      </div>
                      <div className="p-2 border-r border-black col-span-2">
                        <p className="text-[11px] font-semibold">{item.historicalDescription}</p>
                        <p className="text-[10px] text-gray-600">
                          HS CODE: {item.historicalHsCode}
                        </p>
                      </div>
                      <div className="p-2 border-r border-black text-right text-[11px]">
                        {item.quantity}
                      </div>
                      <div className="p-2 border-r border-black text-right text-[11px] font-mono">
                        {formatUSD(item.historicalUnitPrice)}
                      </div>
                      <div className="p-2 text-right text-[11px] font-mono font-semibold">
                        {formatUSD(item.lineTotal)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Section */}
                <div className="mb-6 border border-black text-xs">
                  <div className="grid grid-cols-2">
                    <div className="p-3 border-r border-black">
                      <p className="font-bold mb-2">Commission</p>
                      <p className="font-bold mt-1">Freight</p>
                      <p className="font-bold mt-1">Insurance</p>
                    </div>
                    <div className="p-3 space-y-2">
                      <p>USD 0.00</p>
                      <p>USD {selectedOrder.freightCost.toFixed(2)}</p>
                      <p>USD {selectedOrder.insuranceCost.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="border-t border-black grid grid-cols-2 bg-gray-50 font-bold">
                    <div className="p-3 border-r border-black">AMOUNT CHARGEABLE IN USD</div>
                    <div className="p-3 text-right text-lg font-mono">
                      {formatUSD(selectedOrder.grandTotal)}
                    </div>
                  </div>
                </div>

                {/* Declaration */}
                <div className="mb-6 border border-black p-3 text-xs">
                  <p className="font-bold mb-2">Declaration:</p>
                  <p>We hereby declare that all the above particulars are true and correct.</p>
                </div>

                {/* Signature Area */}
                <div className="border border-black p-3 text-center">
                  <p className="text-xs font-bold mt-12">AUTHORISED SIGNATORY</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
