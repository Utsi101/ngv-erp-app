'use client';

import { CommercialOrderPDF } from '@/components/order/orderPDF';
import { useOrderContent } from '@/hooks/useOrderContent';
import { formatUSD } from '@/lib/format';
import {
  ORDER_LAYOUT,
  getBuyerShippingWidth,
  getColumnWidth,
  getHeaderWidth,
} from '@/lib/order-layout';
import type { CompanyProfile, OrderWithBuyer } from '@/types/order';
import { X } from 'lucide-react';

interface OrderModalProps {
  order: OrderWithBuyer;
  companyProfile: CompanyProfile | null;
  onClose: () => void;
}

export function OrderModal({ order, companyProfile, onClose }: OrderModalProps) {
  const content = useOrderContent(order, companyProfile!);

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto flex-wrap ">
      {/* Virtual A4 Page */}
      <div
        className={`${ORDER_LAYOUT.page.backgroundColor} ${ORDER_LAYOUT.page.maxWidth} aspect-[1/1.414] shadow-2xl relative`}
      >
        {/* Action Buttons - Top Right */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <CommercialOrderPDF order={order} companyProfile={companyProfile} />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Order Content */}
        <div className={`${ORDER_LAYOUT.page.padding} h-full overflow-y-auto`}>
          {/* ===== HEADER SECTION ===== */}
          <div className={`${ORDER_LAYOUT.sections.header}`}>
            <h1 className={`${ORDER_LAYOUT.typography.titleSize} font-bold text-center mb-4`}>
              COMMERCIAL ORDER
            </h1>

            {/* Header Grid: 3 columns */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `${getHeaderWidth('exporter')} ${getHeaderWidth('orderDetails')} ${getHeaderWidth('complianceIds')}`,
              }}
            >
              {/* Left Column: Exporter */}
              <div className={`${ORDER_LAYOUT.borders.cell} p-3`}>
                <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold mb-1`}>EXPORTER</p>
                <p className={`${ORDER_LAYOUT.typography.baseSize} font-semibold`}>
                  {content.header.exporter.name}
                </p>
                <p className={`${ORDER_LAYOUT.typography.smallSize} text-gray-700`}>
                  {content.header.exporter.address1}
                  {content.header.exporter.address2 && `, ${content.header.exporter.address2}`}
                </p>
                <p className={`${ORDER_LAYOUT.typography.smallSize} text-gray-700`}>
                  {companyProfile?.city}, {companyProfile?.state} {companyProfile?.pincode}
                </p>
                <div className={`${ORDER_LAYOUT.typography.smallSize} mt-2 space-y-0.5`}>
                  <p>
                    <strong>GSTIN:</strong> {content.header.exporter.gstin}
                  </p>
                  <p>
                    <strong>IEC:</strong> {content.header.exporter.iec}
                  </p>
                  <p>
                    <strong>PAN:</strong> {content.header.exporter.pan}
                  </p>
                  <p>
                    <strong>AD Code:</strong> {content.header.exporter.adCode}
                  </p>
                </div>
              </div>

              {/* Middle Column: Order Details */}
              <div className={`${ORDER_LAYOUT.borders.cell} p-3`}>
                <div className="mb-3">
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold mb-1`}>
                    ORDER NO. & DATE
                  </p>
                  <p className={`${ORDER_LAYOUT.typography.baseSize} font-mono font-semibold`}>
                    {content.header.invoiceDetails.number}
                  </p>
                  <p className={`${ORDER_LAYOUT.typography.smallSize} text-gray-600`}>
                    {content.header.invoiceDetails.date}
                  </p>
                </div>
                <div>
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold mb-1`}>
                    CONTRACT NO. & DATE
                  </p>
                  <p className={`${ORDER_LAYOUT.typography.smallSize}`}>
                    {content.header.invoiceDetails.contractNumber}
                  </p>
                </div>
              </div>

              {/* Right Column: Compliance IDs */}
              <div className={`${ORDER_LAYOUT.borders.cell} p-3`}>
                <div className="space-y-2">
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>
                    <span className="block">IEC CODE NO.</span>
                    <span className={`${ORDER_LAYOUT.typography.baseSize}`}>
                      {content.header.complianceIds.iecCode}
                    </span>
                  </p>
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>
                    <span className="block">COUNTRY OF ORIGIN</span>
                    <span className={`${ORDER_LAYOUT.typography.baseSize}`}>
                      {content.header.complianceIds.origin}
                    </span>
                  </p>
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>
                    <span className="block">COUNTRY OF DESTINATION</span>
                    <span className={`${ORDER_LAYOUT.typography.baseSize}`}>
                      {content.header.complianceIds.destination}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== BUYER & SHIPPING SECTION ===== */}
          <div className={`${ORDER_LAYOUT.sections.buyerShipping}`}>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `${getBuyerShippingWidth('consignee')} ${getBuyerShippingWidth('shippingAddress')} ${getBuyerShippingWidth('logistics')}`,
              }}
            >
              {/* Left Column: Consignee */}
              <div className={`${ORDER_LAYOUT.borders.cell} p-3`}>
                <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold mb-1`}>CONSIGNEE</p>
                <p className={`${ORDER_LAYOUT.typography.baseSize} font-semibold`}>
                  {content.buyerShipping.consignee.companyName}
                </p>
                {content.buyerShipping.consignee.contactPerson !== '—' && (
                  <p className={`${ORDER_LAYOUT.typography.smallSize} text-gray-700`}>
                    Contact: {content.buyerShipping.consignee.contactPerson}
                  </p>
                )}
                <p className={`${ORDER_LAYOUT.typography.smallSize} text-gray-700 mt-1`}>
                  {content.buyerShipping.consignee.billingAddress}
                </p>
              </div>

              {/* Middle Column: Shipping Address */}
              <div className={`${ORDER_LAYOUT.borders.cell} p-3`}>
                <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold mb-1`}>
                  SHIPPING ADDRESS
                </p>
                <p className={`${ORDER_LAYOUT.typography.smallSize}`}>
                  {content.buyerShipping.shippingAddress}
                </p>
              </div>

              {/* Right Column: Logistics */}
              <div className={`${ORDER_LAYOUT.borders.cell} p-3`}>
                <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold mb-1`}>LOGISTICS</p>
                <div className={`${ORDER_LAYOUT.typography.smallSize} space-y-1`}>
                  <p>
                    <strong>Terms:</strong> {content.buyerShipping.logistics.incoterm}
                  </p>
                  <p>
                    <strong>Vessel:</strong> {content.buyerShipping.logistics.vessel}
                  </p>
                  <p>
                    <strong>Port of Loading:</strong>{' '}
                    {content.buyerShipping.logistics.portOfLoading}
                  </p>
                  <p>
                    <strong>Port of Discharge:</strong>{' '}
                    {content.buyerShipping.logistics.portOfDischarge}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== LINE ITEMS TABLE ===== */}
          <div className={`${ORDER_LAYOUT.sections.table}`}>
            <div className="border border-black overflow-hidden">
              {/* Table Header */}
              <div
                className="grid border-b border-black"
                style={{
                  gridTemplateColumns: `${getColumnWidth('shippingMarks')} ${getColumnWidth('description')} ${getColumnWidth('weight')} ${getColumnWidth('unitPrice')} ${getColumnWidth('totalAmount')}`,
                }}
              >
                <div className={`${ORDER_LAYOUT.borders.headerBg} p-2 border-r border-black`}>
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>
                    Shipping Marks & Pkgs
                  </p>
                </div>
                <div className={`${ORDER_LAYOUT.borders.headerBg} p-2 border-r border-black`}>
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>
                    Description of Goods
                  </p>
                </div>
                <div className={`${ORDER_LAYOUT.borders.headerBg} p-2 border-r border-black`}>
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>Weight (kg)</p>
                </div>
                <div
                  className={`${ORDER_LAYOUT.borders.headerBg} p-2 border-r border-black text-right`}
                >
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>Unit Price USD</p>
                </div>
                <div className={`${ORDER_LAYOUT.borders.headerBg} p-2 text-right`}>
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>Amount USD</p>
                </div>
              </div>

              {/* Table Rows */}
              {content.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid border-b border-black last:border-b-0"
                  style={{
                    gridTemplateColumns: `${getColumnWidth('shippingMarks')} ${getColumnWidth('description')} ${getColumnWidth('weight')} ${getColumnWidth('unitPrice')} ${getColumnWidth('totalAmount')}`,
                  }}
                >
                  {/* Shipping Marks */}
                  <div
                    className={`${ORDER_LAYOUT.borders.cell} p-2 border-r border-b-0 border-t-0`}
                  >
                    <p className={`${ORDER_LAYOUT.typography.smallSize} font-mono`}>
                      {item.skuFull}
                    </p>
                    <p className={`${ORDER_LAYOUT.typography.smallSize} text-gray-600`}>
                      Qty: {item.quantity}
                    </p>
                  </div>

                  {/* Description */}
                  <div
                    className={`${ORDER_LAYOUT.borders.cell} p-2 border-r border-b-0 border-t-0`}
                  >
                    <p className={`${ORDER_LAYOUT.typography.baseSize} font-semibold`}>
                      {item.description}
                    </p>
                    <p className={`${ORDER_LAYOUT.typography.smallSize} text-gray-600`}>
                      HS Code: {item.hsCode}
                    </p>
                  </div>

                  {/* Weight */}
                  <div
                    className={`${ORDER_LAYOUT.borders.cell} p-2 border-r border-b-0 border-t-0`}
                  >
                    <p className={`${ORDER_LAYOUT.typography.smallSize}`}>
                      <strong>Net:</strong> {item.netWeight}
                    </p>
                    <p className={`${ORDER_LAYOUT.typography.smallSize}`}>
                      <strong>Gross:</strong> {item.grossWeight}
                    </p>
                  </div>

                  {/* Unit Price */}
                  <div
                    className={`${ORDER_LAYOUT.borders.cell} p-2 border-r border-b-0 border-t-0 text-right`}
                  >
                    <p className={`${ORDER_LAYOUT.typography.smallSize} font-mono`}>
                      {formatUSD(Number(item.unitPrice))}
                    </p>
                  </div>

                  {/* Total Amount */}
                  <div
                    className={`${ORDER_LAYOUT.borders.cell} p-2 border-b-0 border-t-0 text-right`}
                  >
                    <p className={`${ORDER_LAYOUT.typography.smallSize} font-mono font-semibold`}>
                      {formatUSD(Number(item.lineTotal))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== TOTALS SECTION ===== */}
          <div className={`${ORDER_LAYOUT.sections.totals}`}>
            <div className="border border-black">
              <div className="grid grid-cols-2 border-b border-black">
                <div className={`${ORDER_LAYOUT.borders.cell} p-3 border-r border-b-0 border-t-0`}>
                  <div className="space-y-2">
                    <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>
                      Freight Charges
                    </p>
                    <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>Insurance</p>
                  </div>
                </div>
                <div
                  className={`${ORDER_LAYOUT.borders.cell} p-3 border-b-0 border-t-0 text-right space-y-2`}
                >
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-mono`}>
                    {formatUSD(Number(content.totals.freight))}
                  </p>
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-mono`}>
                    {formatUSD(Number(content.totals.insurance))}
                  </p>
                </div>
              </div>

              {/* Grand Total */}
              <div className="grid grid-cols-2 bg-slate-100">
                <div className={`${ORDER_LAYOUT.borders.cell} p-3 border-r border-b-0 border-t-0`}>
                  <p className={`${ORDER_LAYOUT.typography.headingSize} font-bold`}>
                    TOTAL AMOUNT CHARGEABLE (USD)
                  </p>
                </div>
                <div
                  className={`${ORDER_LAYOUT.borders.cell} p-3 border-b-0 border-t-0 text-right`}
                >
                  <p className={`text-[14pt] font-mono font-bold`}>
                    {formatUSD(Number(content.totals.grandTotal))}
                  </p>
                </div>
              </div>

              {/* Amount Chargeable in Words */}
              <div className="grid grid-cols-2 border-t border-black">
                <div className={`${ORDER_LAYOUT.borders.cell} p-3 border-r border-b-0 border-t-0`}>
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>
                    AMOUNT CHARGEABLE IN WORDS
                  </p>
                </div>
                <div className={`${ORDER_LAYOUT.borders.cell} p-3 border-b-0 border-t-0`}>
                  <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold uppercase`}>
                    {content.totals.amountInWords}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={`${ORDER_LAYOUT.sections.declaration}`}>
            <div className={`${ORDER_LAYOUT.borders.cell} p-3`}>
              <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold mb-1`}>DECLARATION</p>
              <p className={`${ORDER_LAYOUT.typography.smallSize}`}>{content.declaration}</p>
            </div>
          </div>

          {/* ===== SIGNATURE SECTION ===== */}
          <div className={`${ORDER_LAYOUT.sections.signature} mt-8`}>
            <div className="border-t border-black pt-4">
              <p className={`${ORDER_LAYOUT.typography.smallSize} font-bold`}>
                For {content.signature.company}
              </p>
              <p className={`mt-12 ${ORDER_LAYOUT.typography.baseSize} font-bold`}>
                AUTHORISED SIGNATORY
              </p>
              <p className={`${ORDER_LAYOUT.typography.smallSize} text-gray-600 mt-1`}>
                Name & Designation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
