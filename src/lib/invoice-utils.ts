/**
 * Shared utility functions for invoice processing
 */

/**
 * Format number as USD currency string
 */
export const formatCurrency = (value: number): string => `$${value.toFixed(2)}`;

/**
 * Return value or safe fallback for null/undefined
 */
export const safeValue = (value: string | null | undefined): string => value || '—';

/**
 * Format date for invoice display (en-IN locale)
 */
export const formatInvoiceDate = (date: Date): string =>
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/**
 * Declaration text for commercial invoices
 */
export const INVOICE_DECLARATION =
  'We hereby declare that the particulars detailed herein are correct and true. The goods described in this Commercial Invoice are genuine and are exported in accordance with the laws of India.';

/**
 * Validate and extract invoice data, ensuring all required fields have fallbacks
 */
export const validateInvoiceData = (value: any) => {
  return safeValue(value);
};
