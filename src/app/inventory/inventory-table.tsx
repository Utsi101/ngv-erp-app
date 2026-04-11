'use client';

import { createProduct, createVariant } from '@/app/actions/inventory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatUSD, formatWeight } from '@/lib/format';
import { ChevronDown, ChevronRight, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';

type Variant = {
  id: string;
  skuFull: string;
  color: string | null;
  leatherType: string | null;
  stockAllocation: number;
  orderItems: { id: string }[];
};

type Product = {
  id: string;
  skuBase: string;
  description: string;
  hsCode: string;
  unitPriceUsd: number;
  moq: number;
  weightNet: number;
  weightGross: number;
  cbm: number;
  createdAt: Date;
  variants: Variant[];
};

export function InventoryTable({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = products.filter(
    (p) =>
      p.skuBase.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.hsCode.includes(search)
  );

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCreateProduct(formData: FormData) {
    startTransition(async () => {
      await createProduct({
        skuBase: formData.get('skuBase') as string,
        description: formData.get('description') as string,
        hsCode: formData.get('hsCode') as string,
        unitPriceUsd: parseFloat(formData.get('unitPriceUsd') as string),
        moq: parseInt(formData.get('moq') as string) || 1,
        weightNet: parseFloat(formData.get('weightNet') as string),
        weightGross: parseFloat(formData.get('weightGross') as string),
        cbm: parseFloat(formData.get('cbm') as string),
      });
      setProductDialogOpen(false);
      router.refresh();
    });
  }

  function handleCreateVariant(formData: FormData) {
    if (!selectedProductId) return;
    startTransition(async () => {
      await createVariant({
        productId: selectedProductId,
        skuFull: formData.get('skuFull') as string,
        color: (formData.get('color') as string) || undefined,
        leatherType: (formData.get('leatherType') as string) || undefined,
        stockAllocation: parseInt(formData.get('stockAllocation') as string) || 0,
      });
      setVariantDialogOpen(false);
      setSelectedProductId(null);
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
            placeholder="Search SKU, description, HS code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="h-8 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Add Product
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">New Product</DialogTitle>
            </DialogHeader>
            <form action={handleCreateProduct} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">SKU Base</Label>
                  <Input
                    name="skuBase"
                    required
                    className="h-8 text-xs mt-1"
                    placeholder="BAG-001"
                  />
                </div>
                <div>
                  <Label className="text-xs">HS Code</Label>
                  <Input
                    name="hsCode"
                    required
                    className="h-8 text-xs mt-1"
                    placeholder="42022210"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input
                  name="description"
                  required
                  className="h-8 text-xs mt-1"
                  placeholder="Leather crossbody bag"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Unit Price (USD)</Label>
                  <Input
                    name="unitPriceUsd"
                    type="number"
                    step="0.01"
                    required
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">MOQ</Label>
                  <Input name="moq" type="number" defaultValue="1" className="h-8 text-xs mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Net Wt (kg)</Label>
                  <Input
                    name="weightNet"
                    type="number"
                    step="0.01"
                    required
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Gross Wt (kg)</Label>
                  <Input
                    name="weightGross"
                    type="number"
                    step="0.01"
                    required
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">CBM</Label>
                  <Input
                    name="cbm"
                    type="number"
                    step="0.001"
                    required
                    className="h-8 text-xs mt-1"
                  />
                </div>
              </div>
              <Button type="submit" size="sm" className="w-full h-8 text-xs" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider w-8" />
              <TableHead className="text-[10px] uppercase tracking-wider">SKU</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Description</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">HS Code</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right">
                Unit Price
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right">
                Net Wt
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right">
                Gross Wt
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-center">
                Variants
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-xs text-muted-foreground py-8">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => {
                const isExpanded = expandedRows.has(product.id);
                return (
                  <React.Fragment key={product.id}>
                    <TableRow
                      key={product.id}
                      className="cursor-pointer"
                      onClick={() => toggleRow(product.id)}
                    >
                      <TableCell className="pr-0">
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-medium">
                        {product.skuBase}
                      </TableCell>
                      <TableCell className="text-xs">{product.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                          {product.hsCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right tabular-nums">
                        {formatUSD(product.unitPriceUsd)}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">
                        {formatWeight(product.weightNet)}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">
                        {formatWeight(product.weightGross)}
                      </TableCell>
                      <TableCell className="text-xs text-center tabular-nums">
                        {product.variants.length}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProductId(product.id);
                            setVariantDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Variant
                        </Button>
                      </TableCell>
                    </TableRow>
                    {/* Expanded variant rows */}
                    {isExpanded &&
                      product.variants.map((v) => (
                        <TableRow key={v.id} className="bg-muted/30">
                          <TableCell />
                          <TableCell className="text-xs font-mono text-muted-foreground pl-6">
                            ↳ {v.skuFull}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {[v.color, v.leatherType].filter(Boolean).join(' / ') || '—'}
                          </TableCell>
                          <TableCell />
                          <TableCell />
                          <TableCell />
                          <TableCell />
                          <TableCell className="text-xs text-center tabular-nums">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Stock: {v.stockAllocation}
                            </Badge>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      ))}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Variant Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Variant</DialogTitle>
          </DialogHeader>
          <form action={handleCreateVariant} className="space-y-3">
            <div>
              <Label className="text-xs">Full SKU</Label>
              <Input
                name="skuFull"
                required
                className="h-8 text-xs mt-1"
                placeholder="BAG-001-BLK-NAPPA"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Color</Label>
                <Input name="color" className="h-8 text-xs mt-1" placeholder="Black" />
              </div>
              <div>
                <Label className="text-xs">Leather Type</Label>
                <Input name="leatherType" className="h-8 text-xs mt-1" placeholder="Nappa" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Stock Allocation</Label>
              <Input
                name="stockAllocation"
                type="number"
                defaultValue="0"
                className="h-8 text-xs mt-1"
              />
            </div>
            <Button type="submit" size="sm" className="w-full h-8 text-xs" disabled={isPending}>
              {isPending ? 'Creating...' : 'Add Variant'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Summary */}
      <p className="text-[10px] text-muted-foreground">
        Showing {filtered.length} of {products.length} products
      </p>
    </div>
  );
}
