'use client';

import { createInvoice } from '@/app/actions/orders';
import { CompanyProfile } from '@/app/profile/profile-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { FileCheck, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

// ---------- Types ----------
type Variant = {
  id: string;
  skuFull: string;
  color: string | null;
  leatherType: string | null;
  stockAllocation: number;
};

type Product = {
  id: string;
  skuBase: string;
  description: string;
  hsCode: string;
  unitPriceUsd: number;
  weightNet: number;
  weightGross: number;
  cbm: number;
  variants: Variant[];
};

type Buyer = {
  id: string;
  companyName: string;
  country: string;
  orders: unknown[];
};

// ---------- Validation Schema ----------
type InvoiceFormValues = {
  buyerId: string;
  incoterm: 'EXW' | 'FOB' | 'CIF' | 'DAP';
  portOfLoading: string;
  portOfDischarge: string;
  vesselName: string;
  appliedLutNumber: string;
  freightCost: number;
  insuranceCost: number;
  items: { variantId: string; quantity: number }[];
};

const invoiceSchema = z.object({
  buyerId: z.string().min(1, 'Select a buyer'),
  incoterm: z.enum(['EXW', 'FOB', 'CIF', 'DAP']),
  portOfLoading: z.string().optional(),
  portOfDischarge: z.string().optional(),
  vesselName: z.string().optional(),
  appliedLutNumber: z.string().optional(),
  freightCost: z.preprocess((v) => Number(v), z.number().min(0)),
  insuranceCost: z.preprocess((v) => Number(v), z.number().min(0)),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, 'Select a variant'),
        quantity: z.preprocess((v) => Number(v), z.number().int().min(1, 'Min 1')),
      })
    )
    .min(1, 'Add at least one item'),
}) satisfies z.ZodType<Partial<InvoiceFormValues>>;

// ---------- Component ----------
export function InvoiceBuilder({
  buyers,
  products,
  companyProfile,
}: {
  buyers: Buyer[];
  products: Product[];
  companyProfile: CompanyProfile | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  const [selectedVariantIds, setSelectedVariantIds] = useState<Record<number, string>>({});
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      buyerId: '',
      incoterm: 'FOB',
      portOfLoading: '',
      portOfDischarge: '',
      vesselName: '',
      appliedLutNumber: companyProfile?.lutNumber || '',
      freightCost: 0,
      insuranceCost: 0,
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Auto-fill port of loading and LUT from company profile on mount
  useEffect(() => {
    if (companyProfile) {
      if (companyProfile.lutNumber) {
        setValue('appliedLutNumber', companyProfile.lutNumber);
      }
    }
  }, [companyProfile, setValue]);

  // Build a flat map: variantId -> { variant, product }
  const variantMap = useMemo(() => {
    const map = new Map<string, { variant: Variant; product: Product }>();
    for (const product of products) {
      for (const variant of product.variants) {
        map.set(variant.id, { variant, product });
      }
    }
    return map;
  }, [products]);

  // Flat list of all variants for the select
  const allVariants = useMemo(
    () =>
      products.flatMap((p) =>
        p.variants.map((v) => ({
          id: v.id,
          label: `${v.skuFull} — ${p.description}${v.color ? ` (${v.color})` : ''}`,
          unitPrice: p.unitPriceUsd,
        }))
      ),
    [products]
  );

  const selectedBuyer = buyers.find((b) => b.id === selectedBuyerId);

  const watchedItems = watch('items');
  const watchedFreight = watch('freightCost');
  const watchedInsurance = watch('insuranceCost');

  // Auto-calculate totals
  const lineItemTotals = watchedItems.map((item) => {
    const info = variantMap.get(item.variantId);
    if (!info) return { unitPrice: 0, lineTotal: 0, description: '—', hsCode: '—', skuFull: '—' };
    return {
      unitPrice: info.product.unitPriceUsd,
      lineTotal: info.product.unitPriceUsd * (item.quantity || 0),
      description: info.product.description,
      hsCode: info.product.hsCode,
      skuFull: info.variant.skuFull,
    };
  });

  const subTotal = lineItemTotals.reduce((s, li) => s + li.lineTotal, 0);
  const grandTotal = subTotal + (Number(watchedFreight) || 0) + (Number(watchedInsurance) || 0);

  function onSubmit(data: InvoiceFormValues) {
    setSubmitError(null);
    setSubmitSuccess(false);

    startTransition(async () => {
      const result = await createInvoice(data);
      if (result.success) {
        setSubmitSuccess(true);
        router.refresh();
      } else {
        setSubmitError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader className="px-4 pt-3 pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
            <FileCheck className="h-3 w-3" />
            New Export Invoice
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="px-4 pt-4 pb-4 space-y-4">
          {/* Row 1: Buyer & Incoterm */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Buyer</Label>
              <Select
                value={selectedBuyer?.companyName || selectedBuyerId}
                onValueChange={(val) => {
                  setSelectedBuyerId(val ?? '');
                  setValue('buyerId', val ?? '');
                }}
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue placeholder="Select buyer..." />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">
                      {b.companyName} ({b.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.buyerId && (
                <p className="text-[10px] text-destructive mt-0.5">{errors.buyerId.message}</p>
              )}
            </div>

            <div>
              <Label className="text-xs">Incoterm</Label>
              <Select
                defaultValue="FOB"
                onValueChange={(val) => {
                  if (val) setValue('incoterm', String(val) as 'EXW' | 'FOB' | 'CIF' | 'DAP');
                }}
              >
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['EXW', 'FOB', 'CIF', 'DAP'].map((term) => (
                    <SelectItem key={term} value={term} className="text-xs">
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">LUT Number</Label>
              <Input
                {...register('appliedLutNumber')}
                className="h-8 text-xs mt-1"
                placeholder="AD180326000001F"
              />
            </div>
          </div>

          {/* Row 2: Logistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Port of Loading</Label>
              <Input
                {...register('portOfLoading')}
                className="h-8 text-xs mt-1"
                placeholder="INNSA"
              />
            </div>
            <div>
              <Label className="text-xs">Port of Discharge</Label>
              <Input
                {...register('portOfDischarge')}
                className="h-8 text-xs mt-1"
                placeholder="USLAX"
              />
            </div>
            <div>
              <Label className="text-xs">Vessel Name</Label>
              <Input
                {...register('vesselName')}
                className="h-8 text-xs mt-1"
                placeholder="MSC Oscar"
              />
            </div>
            <div />
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium">Line Items</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[10px] gap-1"
                onClick={() => append({ variantId: '', quantity: 1 })}
              >
                <Plus className="h-3 w-3" />
                Add Item
              </Button>
            </div>

            {errors.items && typeof errors.items.message === 'string' && (
              <p className="text-[10px] text-destructive mb-2">{errors.items.message}</p>
            )}

            {fields.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6 border rounded-md">
                No items added. Click &quot;Add Item&quot; to begin.
              </p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase tracking-wider">
                        Product / Variant
                      </TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider">
                        HS Code
                      </TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-right w-24">
                        Unit Price
                      </TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-right w-20">
                        Qty
                      </TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-right w-28">
                        Line Total
                      </TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const info = lineItemTotals[index];
                      const selectedVariantId = selectedVariantIds[index];
                      return (
                        <TableRow key={field.id}>
                          <TableCell className="py-1">
                            <Select
                              value={selectedVariantId || ''}
                              onValueChange={(val) => {
                                if (val) {
                                  setSelectedVariantIds((prev) => ({ ...prev, [index]: val }));
                                  setValue(`items.${index}.variantId`, String(val));
                                }
                              }}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                {selectedVariantId && info?.skuFull ? (
                                  <span className="text-xs">{info.skuFull}</span>
                                ) : (
                                  <SelectValue placeholder="Select variant..." />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                {allVariants.map((v) => (
                                  <SelectItem key={v.id} value={v.id} className="text-xs">
                                    {v.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.items?.[index]?.variantId && (
                              <p className="text-[9px] text-destructive">
                                {errors.items[index].variantId?.message}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="py-1">
                            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                              {info?.hsCode ?? '—'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right tabular-nums py-1">
                            {formatUSD(info?.unitPrice ?? 0)}
                          </TableCell>
                          <TableCell className="py-1">
                            <Input
                              {...register(`items.${index}.quantity`)}
                              type="number"
                              min="1"
                              className="h-7 text-xs text-right w-16 ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right tabular-nums font-medium py-1">
                            {formatUSD(info?.lineTotal ?? 0)}
                          </TableCell>
                          <TableCell className="py-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                remove(index);
                                setSelectedVariantIds((prev) => {
                                  const newState = { ...prev };
                                  delete newState[index];
                                  return newState;
                                });
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <Separator />

          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div>
              <Label className="text-xs">Freight Cost (USD)</Label>
              <Input
                {...register('freightCost')}
                type="number"
                step="0.01"
                min="0"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Insurance Cost (USD)</Label>
              <Input
                {...register('insuranceCost')}
                type="number"
                step="0.01"
                min="0"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div className="col-span-2 text-right space-y-1">
              <div className="flex justify-end gap-4 text-xs">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-mono tabular-nums font-medium w-28">
                  {formatUSD(subTotal)}
                </span>
              </div>
              <div className="flex justify-end gap-4 text-xs">
                <span className="text-muted-foreground">Freight:</span>
                <span className="font-mono tabular-nums w-28">
                  {formatUSD(Number(watchedFreight) || 0)}
                </span>
              </div>
              <div className="flex justify-end gap-4 text-xs">
                <span className="text-muted-foreground">Insurance:</span>
                <span className="font-mono tabular-nums w-28">
                  {formatUSD(Number(watchedInsurance) || 0)}
                </span>
              </div>
              <Separator className="ml-auto w-40" />
              <div className="flex justify-end gap-4 text-sm font-semibold">
                <span>Grand Total:</span>
                <span className="font-mono tabular-nums w-28">{formatUSD(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {submitError && <p className="text-[10px] text-destructive">{submitError}</p>}
              {submitSuccess && (
                <p className="text-[10px] text-green-600 font-medium">
                  Invoice created successfully!
                </p>
              )}
            </div>
            <Button type="submit" size="sm" className="h-8 text-xs gap-1.5" disabled={isPending}>
              <FileCheck className="h-3 w-3" />
              {isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
