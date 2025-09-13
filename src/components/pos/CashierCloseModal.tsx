import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  CashierClosePayload, 
  DenominationEntry, 
  PaymentModeTotal 
} from '../../types/cashier';
import { 
  calculateDenominationTotal, 
  calculateVariance, 
  validateDenominationEntries,
  calculatePaymentModeTotal,
  isVarianceExceeded,
  formatCurrency,
  createDenominationEntries
} from '../../utils/cashierUtils';
import logger from '../../utils/logger';

interface CashierCloseModalProps {
  open: boolean;
  onClose: () => void;
  expectedAmount: number;
  cashierId: string;
  onSubmit?: (payload: CashierClosePayload) => void;
}

const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'others', label: 'Others' },
];

export const CashierCloseModal: React.FC<CashierCloseModalProps> = ({
  open,
  onClose,
  expectedAmount,
  cashierId,
  onSubmit,
}) => {
  const { settings } = useSettings();
  const [denominationEntries, setDenominationEntries] = useState<DenominationEntry[]>([]);
  const [paymentModeTotals, setPaymentModeTotals] = useState<PaymentModeTotal[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize denomination entries from settings
  useEffect(() => {
    if (settings.cashCounter?.denominations) {
      const entries = createDenominationEntries(settings.cashCounter.denominations);
      setDenominationEntries(entries);
    }
  }, [settings.cashCounter?.denominations]);

  // Initialize payment mode totals
  useEffect(() => {
    const initialPaymentModes = PAYMENT_MODES.map(mode => ({
      mode: mode.value,
      amount: 0,
    }));
    setPaymentModeTotals(initialPaymentModes);
  }, []);

  const countedTotal = calculateDenominationTotal(denominationEntries);
  const paymentModeTotal = calculatePaymentModeTotal(paymentModeTotals);
  const variance = calculateVariance(expectedAmount, countedTotal);
  const isVarianceExceededThreshold = settings.cashCounter?.variance_threshold 
    ? isVarianceExceeded(variance, settings.cashCounter.variance_threshold)
    : false;

  const handleDenominationChange = (index: number, count: number) => {
    const newEntries = [...denominationEntries];
    newEntries[index] = {
      ...newEntries[index],
      count: Math.max(0, count),
      total: newEntries[index].value * Math.max(0, count),
    };
    setDenominationEntries(newEntries);
  };

  const handlePaymentModeChange = (index: number, amount: number) => {
    const newPaymentModes = [...paymentModeTotals];
    newPaymentModes[index] = {
      ...newPaymentModes[index],
      amount: Math.max(0, amount),
    };
    setPaymentModeTotals(newPaymentModes);
  };

  const handleSaveDraft = () => {
    logger.info('cashier_close_draft_saved', {
      cashierId,
      expectedAmount,
      countedTotal,
      variance,
    });
    // TODO: Implement draft saving logic
    console.log('Draft saved');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate denomination entries
      if (!validateDenominationEntries(denominationEntries)) {
        throw new Error('All denomination counts must be non-negative integers');
      }

      // Validate payment mode totals match expected amount
      if (Math.abs(paymentModeTotal - expectedAmount) > 0.01) {
        throw new Error('Payment mode totals must equal expected amount');
      }

      // Check if cash counted matches cash payment mode
      const cashPaymentMode = paymentModeTotals.find(pm => pm.mode === 'cash');
      if (cashPaymentMode && Math.abs(cashPaymentMode.amount - countedTotal) > 0.01) {
        throw new Error('Cash denomination total must match cash payment mode amount');
      }

      const payload: CashierClosePayload = {
        cashier_id: cashierId,
        closing_date: new Date().toISOString(),
        expected_total: expectedAmount,
        denominations: denominationEntries,
        payment_mode_totals: paymentModeTotals,
        notes: notes || undefined,
      };

      logger.info('cashier_close_attempt', {
        cashierId,
        expected: expectedAmount,
        counted: countedTotal,
        variance,
        paymentModeTotal,
      });

      if (onSubmit) {
        await onSubmit(payload);
      }

      // Reset form
      setDenominationEntries(createDenominationEntries(settings.cashCounter?.denominations || []));
      setPaymentModeTotals(PAYMENT_MODES.map(mode => ({ mode: mode.value, amount: 0 })));
      setNotes('');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit cashier close';
      setError(errorMessage);
      logger.error('cashier_close_submit_failed', { error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && 
    validateDenominationEntries(denominationEntries) &&
    Math.abs(paymentModeTotal - expectedAmount) <= 0.01 &&
    Math.abs((paymentModeTotals.find(pm => pm.mode === 'cash')?.amount || 0) - countedTotal) <= 0.01;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Cashier Close - Balance Reconciliation</Typography>
          <Button
            startIcon={<CloseIcon />}
            onClick={onClose}
            size="small"
          >
            Close
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Summary Card */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Expected Total
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(expectedAmount, settings.cashCounter?.currency)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Counted Total
                    </Typography>
                    <Typography variant="h6" color={variance === 0 ? 'success.main' : 'warning.main'}>
                      {formatCurrency(countedTotal, settings.cashCounter?.currency)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Variance
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={variance === 0 ? 'success.main' : variance > 0 ? 'warning.main' : 'error.main'}
                    >
                      {formatCurrency(variance, settings.cashCounter?.currency)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Mode Total
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(paymentModeTotal, settings.cashCounter?.currency)}
                    </Typography>
                  </Grid>
                </Grid>
                {isVarianceExceededThreshold && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Variance exceeds threshold of {formatCurrency(settings.cashCounter?.variance_threshold || 0, settings.cashCounter?.currency)}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Denominations */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Denomination Count
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {denominationEntries.map((entry, index) => (
                <Box key={entry.value} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`${settings.cashCounter?.currency || 'INR'} ${entry.value}`}
                    type="number"
                    value={entry.count}
                    onChange={(e) => handleDenominationChange(index, parseInt(e.target.value) || 0)}
                    inputProps={{ min: 0 }}
                    size="small"
                    helperText={`Total: ${formatCurrency(entry.total, settings.cashCounter?.currency)}`}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Payment Mode Totals */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Payment Mode Totals
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {paymentModeTotals.map((pmt, index) => (
                <Box key={pmt.mode} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={PAYMENT_MODES.find(mode => mode.value === pmt.mode)?.label}
                    type="number"
                    value={pmt.amount}
                    onChange={(e) => handlePaymentModeChange(index, parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, step: 0.01 }}
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the cashier close..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          startIcon={<SaveIcon />}
          onClick={handleSaveDraft}
          disabled={loading}
        >
          Save Draft
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {loading ? 'Submitting...' : 'Submit for Verification'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
