import type { StatusConfig } from '@/types';

export const STATUS_LABELS: Record<string, StatusConfig> = {
  DRAFT: { label: 'Draft', variant: 'outline' },
  PROFORMA_SENT: { label: 'Proforma', variant: 'secondary' },
  ADVANCE_RECEIVED: { label: 'Advance Rcvd', variant: 'default' },
  IN_PRODUCTION: { label: 'Production', variant: 'default' },
  READY_FOR_DISPATCH: { label: 'Ready', variant: 'default' },
  SHIPPED: { label: 'Shipped', variant: 'default' },
  PAYMENT_REALIZED: { label: 'Paid', variant: 'secondary' },
  REGULATORY_CLOSED: { label: 'Closed', variant: 'secondary' },
};
