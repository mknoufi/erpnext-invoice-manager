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
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  AccountBalance as AccountIcon
} from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';
import { fetchLedgerAccounts, fetchDenominations, createJournalEntry } from '../../api/erpnextSettingsService';

interface PayoutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (payout: Payout) => void;
  onSubmit?: (data: any) => Promise<void>;
}

interface Payout {
  id: string;
  date: string;
  type: 'Accountable' | 'Non-Accountable';
  purpose: string;
  amount: number;
  account: string;
  denominations: DenominationCount[];
  reference: string;
  notes?: string;
  approvedBy?: string;
}

interface DenominationCount {
  denomination: number;
  count: number;
  total: number;
}

const PayoutModal = memo<PayoutModalProps>(({
  open,
  onClose,
  onSuccess
}) => {
  const { settings } = useSettings();
  const [ledgerAccounts, setLedgerAccounts] = useState<any[]>([]);
  const [denominations, setDenominations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [payoutType, setPayoutType] = useState<'Accountable' | 'Non-Accountable'>('Accountable');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState(0);
  const [account, setAccount] = useState('');
  const [denominationCounts, setDenominationCounts] = useState<DenominationCount[]>([]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [approvedBy, setApprovedBy] = useState('');

  // Calculate total from denominations - memoized for performance
  const calculatedTotal = useMemo(() => 
    denominationCounts.reduce((sum, denom) => sum + denom.total, 0), 
    [denominationCounts]
  );

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [accounts, denoms] = await Promise.all([
        fetchLedgerAccounts(),
        fetchDenominations(settings.erpnext?.defaultCurrency || 'USD')
      ]);
      
      setLedgerAccounts(accounts);
      setDenominations(denoms);
      
      // Initialize denomination counts
      const initialCounts = denoms.map(denom => ({
        denomination: denom.denomination,
        count: 0,
        total: 0
      }));
      setDenominationCounts(initialCounts);
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load payout settings');
    } finally {
      setLoading(false);
    }
  }, [settings.erpnext?.defaultCurrency]);

  const initializeForm = useCallback(() => {
    setPurpose('');
    setAmount(0);
    setAccount('');
    setReference('');
    setNotes('');
    setApprovedBy('');
    setDenominationCounts(denominations.map(denom => ({
      denomination: denom.denomination,
      count: 0,
      total: 0
    })));
  }, [denominations]);

  useEffect(() => {
    if (open) {
      loadSettings();
      initializeForm();
    }
  }, [open, loadSettings, initializeForm]);

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

      // Create journal entry in ERPNext
      const journalData = {
        posting_date: new Date().toISOString().split('T')[0],
        company: settings.erpnext?.company || 'Your Company',
        accounts: [
          {
            account: account,
            debit_in_account_currency: amount,
            credit_in_account_currency: 0
          },
          {
            account: 'Cash', // Cash account
            debit_in_account_currency: 0,
            credit_in_account_currency: amount
          }
        ],
        user_remark: `${payoutType} Payout: ${purpose}${notes ? ` - ${notes}` : ''}`
      };

      const journalEntry = await createJournalEntry(journalData);

      const payout: Payout = {
        id: journalEntry.name || 'PAYOUT-' + Date.now(),
        date: new Date().toISOString(),
        type: payoutType,
        purpose,
        amount,
        account,
        denominations: denominationCounts.filter(d => d.count > 0),
        reference,
        notes,
        approvedBy: payoutType === 'Accountable' ? approvedBy : undefined
      };

      onSuccess(payout);
      onClose();
    } catch (error) {
      console.error('Error creating payout:', error);
      setError('Failed to process payout');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const getPayoutTypeDescription = (type: string) => {
    switch (type) {
      case 'Accountable':
        return 'Requires approval and documentation (e.g., staff advances, transport expenses)';
      case 'Non-Accountable':
        return 'No approval required (e.g., petty cash, small expenses)';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <PaymentIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Cash Payout</Typography>
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
          {/* Payout Type */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Payout Type
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={payoutType}
                onChange={(e) => setPayoutType(e.target.value as 'Accountable' | 'Non-Accountable')}
              >
                <FormControlLabel
                  value="Accountable"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Accountable</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {getPayoutTypeDescription('Accountable')}
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="Non-Accountable"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Non-Accountable</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {getPayoutTypeDescription('Non-Accountable')}
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Payout Details
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              placeholder="e.g., Staff advance, Transport expense, Petty cash"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Account</InputLabel>
              <Select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
              >
                {ledgerAccounts.map((acc) => (
                  <MenuItem key={acc.name} value={acc.name}>
                    <Box display="flex" alignItems="center">
                      <AccountIcon sx={{ mr: 1, fontSize: 16 }} />
                      {acc.account_name} ({acc.account_type})
                    </Box>
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
              placeholder="Receipt number, voucher, etc."
            />
          </Grid>

          {payoutType === 'Accountable' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Approved By"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                required
                placeholder="Manager name or approval reference"
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or documentation..."
            />
          </Grid>

          {/* Denomination Tracking */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Cash Denomination
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Count the cash being paid out by denomination
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
                  color={Math.abs(calculatedTotal - amount) < 0.01 ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !purpose || amount <= 0 || !account || (payoutType === 'Accountable' && !approvedBy)}
          startIcon={<PaymentIcon />}
        >
          {loading ? 'Processing...' : 'Process Payout'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

PayoutModal.displayName = 'PayoutModal';

export default PayoutModal;