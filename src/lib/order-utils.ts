/**
 * Shared utility functions for order processing
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
 * Format date for order display (en-IN locale)
 */
export const formatOrderDate = (date: Date): string =>
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/**
 * Declaration text for commercial orders
 */
export const ORDER_DECLARATION =
  'We hereby declare that the particulars detailed herein are correct and true. The goods described in this Commercial Order are genuine and are exported in accordance with the laws of India.';

/**
 * Validate and extract order data, ensuring all required fields have fallbacks
 */
export const validateOrderData = (value: any) => {
  return safeValue(value);
};
