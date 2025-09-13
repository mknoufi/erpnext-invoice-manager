import {
  calculateDenominationTotal,
  calculateVariance,
  validateDenominationEntries,
  calculatePaymentModeTotal,
  isVarianceExceeded,
  formatCurrency,
  createDenominationEntries,
} from '../cashierUtils';
import { DenominationEntry } from '../../types/cashier';

describe('cashierUtils', () => {
  describe('calculateDenominationTotal', () => {
    it('should calculate total correctly for valid entries', () => {
      const entries: DenominationEntry[] = [
        { value: 1000, count: 2, total: 2000 },
        { value: 500, count: 3, total: 1500 },
        { value: 100, count: 5, total: 500 },
      ];

      const result = calculateDenominationTotal(entries);
      expect(result).toBe(4000);
    });

    it('should return 0 for empty entries', () => {
      const result = calculateDenominationTotal([]);
      expect(result).toBe(0);
    });

    it('should handle zero counts', () => {
      const entries: DenominationEntry[] = [
        { value: 1000, count: 0, total: 0 },
        { value: 500, count: 2, total: 1000 },
      ];

      const result = calculateDenominationTotal(entries);
      expect(result).toBe(1000);
    });
  });

  describe('calculateVariance', () => {
    it('should calculate positive variance correctly', () => {
      const result = calculateVariance(1000, 1200);
      expect(result).toBe(200);
    });

    it('should calculate negative variance correctly', () => {
      const result = calculateVariance(1000, 800);
      expect(result).toBe(-200);
    });

    it('should return 0 for equal amounts', () => {
      const result = calculateVariance(1000, 1000);
      expect(result).toBe(0);
    });
  });

  describe('validateDenominationEntries', () => {
    it('should return true for valid entries', () => {
      const entries: DenominationEntry[] = [
        { value: 1000, count: 2, total: 2000 },
        { value: 500, count: 0, total: 0 },
        { value: 100, count: 5, total: 500 },
      ];

      const result = validateDenominationEntries(entries);
      expect(result).toBe(true);
    });

    it('should return false for negative counts', () => {
      const entries: DenominationEntry[] = [
        { value: 1000, count: -1, total: -1000 },
        { value: 500, count: 2, total: 1000 },
      ];

      const result = validateDenominationEntries(entries);
      expect(result).toBe(false);
    });

    it('should return false for non-integer counts', () => {
      const entries: DenominationEntry[] = [
        { value: 1000, count: 1.5, total: 1500 },
        { value: 500, count: 2, total: 1000 },
      ];

      const result = validateDenominationEntries(entries);
      expect(result).toBe(false);
    });
  });

  describe('calculatePaymentModeTotal', () => {
    it('should calculate total correctly', () => {
      const paymentModes = [
        { mode: 'cash', amount: 1000 },
        { mode: 'card', amount: 500 },
        { mode: 'upi', amount: 300 },
      ];

      const result = calculatePaymentModeTotal(paymentModes);
      expect(result).toBe(1800);
    });

    it('should return 0 for empty array', () => {
      const result = calculatePaymentModeTotal([]);
      expect(result).toBe(0);
    });
  });

  describe('isVarianceExceeded', () => {
    it('should return true when variance exceeds threshold', () => {
      const result = isVarianceExceeded(150, 100);
      expect(result).toBe(true);
    });

    it('should return true for negative variance exceeding threshold', () => {
      const result = isVarianceExceeded(-150, 100);
      expect(result).toBe(true);
    });

    it('should return false when variance is within threshold', () => {
      const result = isVarianceExceeded(50, 100);
      expect(result).toBe(false);
    });

    it('should return false when variance equals threshold', () => {
      const result = isVarianceExceeded(100, 100);
      expect(result).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    it('should format INR currency correctly', () => {
      const result = formatCurrency(1234.56, 'INR');
      expect(result).toBe('₹1,234.56');
    });

    it('should format USD currency correctly', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toBe('$1,234.56');
    });

    it('should use INR as default currency', () => {
      const result = formatCurrency(1234.56);
      expect(result).toBe('₹1,234.56');
    });

    it('should handle zero amount', () => {
      const result = formatCurrency(0, 'INR');
      expect(result).toBe('₹0.00');
    });
  });

  describe('createDenominationEntries', () => {
    it('should create entries with zero counts', () => {
      const denominations = [1000, 500, 100];
      const result = createDenominationEntries(denominations);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ value: 1000, count: 0, total: 0 });
      expect(result[1]).toEqual({ value: 500, count: 0, total: 0 });
      expect(result[2]).toEqual({ value: 100, count: 0, total: 0 });
    });

    it('should sort denominations in descending order', () => {
      const denominations = [100, 1000, 500];
      const result = createDenominationEntries(denominations);

      expect(result[0].value).toBe(1000);
      expect(result[1].value).toBe(500);
      expect(result[2].value).toBe(100);
    });

    it('should handle empty array', () => {
      const result = createDenominationEntries([]);
      expect(result).toEqual([]);
    });
  });
});
