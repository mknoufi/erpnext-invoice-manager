import { DenominationEntry } from '../types/cashier';

/**
 * Calculate total amount from denomination entries
 * @param entries Array of denomination entries with value, count, and total
 * @returns Total amount calculated from denominations
 */
export const calculateDenominationTotal = (entries: DenominationEntry[]): number => {
  return entries.reduce((total, entry) => {
    const entryTotal = entry.value * entry.count;
    return total + entryTotal;
  }, 0);
};

/**
 * Calculate variance between expected and counted amounts
 * @param expected Expected total amount
 * @param counted Actually counted amount
 * @returns Variance (counted - expected)
 */
export const calculateVariance = (expected: number, counted: number): number => {
  return counted - expected;
};

/**
 * Validate denomination entries for non-negative counts
 * @param entries Array of denomination entries
 * @returns True if all counts are non-negative integers
 */
export const validateDenominationEntries = (entries: DenominationEntry[]): boolean => {
  return entries.every(entry => 
    Number.isInteger(entry.count) && entry.count >= 0
  );
};

/**
 * Calculate payment mode totals sum
 * @param paymentModeTotals Array of payment mode totals
 * @returns Sum of all payment mode amounts
 */
export const calculatePaymentModeTotal = (paymentModeTotals: { mode: string; amount: number }[]): number => {
  return paymentModeTotals.reduce((total, pmt) => total + pmt.amount, 0);
};

/**
 * Check if variance exceeds threshold
 * @param variance Calculated variance
 * @param threshold Variance threshold (absolute value)
 * @returns True if variance exceeds threshold
 */
export const isVarianceExceeded = (variance: number, threshold: number): boolean => {
  return Math.abs(variance) > threshold;
};

/**
 * Format currency amount for display
 * @param amount Amount to format
 * @param currency Currency code (default: 'INR')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Create denomination entries from settings
 * @param denominations Array of denomination values
 * @returns Array of denomination entries with zero counts
 */
export const createDenominationEntries = (denominations: number[]): DenominationEntry[] => {
  return denominations
    .sort((a, b) => b - a) // Sort descending
    .map(value => ({
      value,
      count: 0,
      total: 0,
    }));
};
