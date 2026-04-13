import { ToWords } from 'to-words';

/**
 * Initialize ToWords converter with US Dollar configuration
 * Supports both standard (Million/Billion) and Indian (Lakh/Crore) numeral systems
 */
const toWordsConverter = new ToWords({
  localeCode: 'en-US', // Use en-US for Million/Billion
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      name: 'US Dollar',
      plural: 'US Dollars',
      symbol: '$',
      fractionalUnit: {
        name: 'Cent',
        plural: 'Cents',
        symbol: '',
      },
    },
  },
});

/**
 * Convert a USD amount to formal English words
 * @param amount - Numerical amount in USD (e.g., 809928.50)
 * @returns Formatted string in UPPERCASE with "ONLY" suffix
 * @example
 * convertUsdToWords(809928.50)
 * // Returns: "EIGHT HUNDRED NINE THOUSAND NINE HUNDRED TWENTY EIGHT US DOLLARS AND FIFTY CENTS ONLY"
 */
export function convertUsdToWords(amount: number): string {
  try {
    // Convert to words and ensure uppercase
    const wordsString = toWordsConverter.convert(amount, {
      currency: true,
      ignoreDecimal: false,
    });

    return wordsString.toUpperCase();
  } catch (error) {
    console.error('Error converting amount to words:', error);
    // Fallback for any conversion errors
    return `USD ${amount.toFixed(2)}`;
  }
}

/**
 * Safe wrapper that handles edge cases
 * @param amount - Numerical amount or string
 * @returns Formatted words string or error string
 */
export function getAmountInWords(amount: number | string): string {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
      return 'INVALID AMOUNT';
    }

    if (numAmount === 0) {
      return 'ZERO US DOLLARS ONLY';
    }

    return convertUsdToWords(numAmount);
  } catch (error) {
    console.error('Error in getAmountInWords:', error);
    return 'ERROR IN CONVERSION';
  }
}
