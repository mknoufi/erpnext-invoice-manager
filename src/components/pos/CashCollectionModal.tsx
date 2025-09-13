import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Paper,
  Chip,
  IconButton
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';
import { fetchPaymentModes, fetchDenominations, createPaymentEntry } from '../../api/erpnextSettingsService';

interface CashCollectionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (collection: CashCollection) => void;
  selectedInvoices?: Array<{
    name: string;
    customer_name: string;
    outstanding_amount: number;
    currency: string;
  }>;
}

interface CashCollection {
  id: string;
  date: string;
  customer: string;
  totalAmount: number;
  paymentMode: string;
  denominations: DenominationCount[];
  reference: string;
  notes?: string;
}

interface DenominationCount {
  denomination: number;
  count: number;
  total: number;
}

const CashCollectionModal = memo<CashCollectionModalProps>(({
  open,
  onClose,
  onSuccess,
  selectedInvoices = []
}) => {
  const { settings } = useSettings();
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [customer, setCustomer] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [denominationCounts, setDenominationCounts] = useState<DenominationCount[]>([]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Calculate total from denominations - memoized for performance
  const calculatedTotal = useMemo(() => 
    denominationCounts.reduce((sum, denom) => sum + denom.total, 0), 
    [denominationCounts]
  );

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [modes, denoms] = await Promise.all([
        fetchPaymentModes(),
        fetchDenominations(settings.erpnext?.defaultCurrency || 'USD')
      ]);
      
      setPaymentModes(modes);
      
      // Initialize denomination counts
      const initialCounts = denoms.map(denom => ({
        denomination: denom.denomination,
        count: 0,
        total: 0
      }));
      setDenominationCounts(initialCounts);
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  }, [settings.erpnext?.defaultCurrency]);

  const initializeForm = useCallback(() => {
    if (selectedInvoices.length > 0) {
      const total = selectedInvoices.reduce((sum, inv) => sum + inv.outstanding_amount, 0);
      setTotalAmount(total);
      setCustomer(selectedInvoices[0].customer_name);
      setReference(selectedInvoices.map(inv => inv.name).join(', '));
    } else {
      setTotalAmount(0);
      setCustomer('');
      setReference('');
    }
  }, [selectedInvoices]);

  useEffect(() => {
    if (open) {
      loadSettings();
      initializeForm();
    }
  }, [open, selectedInvoices, loadSettings, initializeForm]);

  const updateDenominationCount = (index: number, count: number) => {
    const newCounts = [...denominationCounts];
    newCounts[index] = {
      ...newCounts[index],
      count: count,
      total: count * newCounts[index].denomination
    };
    setDenominationCounts(newCounts);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create payment entry in ERPNext
      const paymentData = {
        payment_type: 'Receive' as const,
        party_type: 'Customer' as const,
        party: customer,
        mode_of_payment: paymentMode,
        paid_amount: totalAmount,
        received_amount: totalAmount,
        references: selectedInvoices.map(inv => ({
          reference_doctype: 'Sales Invoice',
          reference_name: inv.name,
          allocated_amount: inv.outstanding_amount
        })),
        posting_date: new Date().toISOString().split('T')[0],
        company: settings.erpnext?.company || 'Your Company',
        currency: settings.erpnext?.defaultCurrency || 'USD'
      };

      const paymentEntry = await createPaymentEntry(paymentData);

      const collection: CashCollection = {
        id: paymentEntry.name || 'CASH-' + Date.now(),
        date: new Date().toISOString(),
        customer,
        totalAmount,
        paymentMode,
        denominations: denominationCounts.filter(d => d.count > 0),
        reference,
        notes
      };

      onSuccess(collection);
      onClose();
    } catch (error) {
      console.error('Error creating cash collection:', error);
      setError('Failed to process cash collection');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <MoneyIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Cash Collection</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Collection Details
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Customer"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Total Amount"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              required
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                {paymentModes.map((mode) => (
                  <MenuItem key={mode.name} value={mode.name}>
                    {mode.mode_of_payment}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Invoice numbers, etc."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </Grid>

          {/* Denomination Tracking */}
          {paymentMode === 'Cash' && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Cash Denomination
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Count the cash received by denomination
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {denominationCounts.map((denom, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2">
                            ${denom.denomination.toFixed(2)}
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() => updateDenominationCount(index, Math.max(0, denom.count - 1))}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <TextField
                              size="small"
                              type="number"
                              value={denom.count}
                              onChange={(e) => updateDenominationCount(index, Number(e.target.value))}
                              sx={{ width: 60, mx: 1 }}
                              inputProps={{ min: 0 }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => updateDenominationCount(index, denom.count + 1)}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        {denom.total > 0 && (
                          <Typography variant="caption" color="primary">
                            = ${denom.total.toFixed(2)}
                          </Typography>
                        )}
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                      Calculated Total:
                    </Typography>
                    <Chip
                      label={`$${calculatedTotal.toFixed(2)}`}
                      color={Math.abs(calculatedTotal - totalAmount) < 0.01 ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                </Paper>
              </Grid>
            </>
          )}

          {/* Selected Invoices */}
          {selectedInvoices.length > 0 && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Selected Invoices
                </Typography>
              </Grid>
              <Grid item xs={12}>
                {selectedInvoices.map((invoice) => (
                  <Chip
                    key={invoice.name}
                    label={`${invoice.name} - $${invoice.outstanding_amount.toFixed(2)}`}
                    sx={{ mr: 1, mb: 1 }}
                    icon={<ReceiptIcon />}
                  />
                ))}
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !customer || totalAmount <= 0}
          startIcon={<MoneyIcon />}
        >
          {loading ? 'Processing...' : 'Process Collection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

CashCollectionModal.displayName = 'CashCollectionModal';

export default CashCollectionModal;
