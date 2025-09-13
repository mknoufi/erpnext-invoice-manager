import React, { useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Alert, CircularProgress } from '@mui/material';
import type { InvoiceSummary, PaymentMode } from '../../types/pos';

type Props = {
  open: boolean;
  onClose: () => void;
  invoices: InvoiceSummary[];
  onSubmit: (payload: { invoiceId: string; mode: PaymentMode; amount: number; reference?: string; tags?: string[] }) => Promise<void>;
};

const modes: PaymentMode[] = ['Cash', 'Card', 'UPI', 'Cheque', 'BankTransfer', 'Wallet'];

const PaymentModal: React.FC<Props> = ({ open, onClose, invoices, onSubmit }) => {
  const [invoiceId, setInvoiceId] = useState('');
  const [mode, setMode] = useState<PaymentMode>('Cash');
  const [amount, setAmount] = useState<string>('');
  const [reference, setReference] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedInvoice = useMemo(() => invoices.find(i => i.id === invoiceId), [invoices, invoiceId]);
  const maxAmount = selectedInvoice ? Math.max(selectedInvoice.outstanding, 0) : undefined;

  const handleSubmit = async () => {
    try {
      setError('');
      if (!invoiceId) return setError('Select an invoice');
      const num = Number(amount || '0');
      if (!num || num <= 0) return setError('Enter a positive amount');
      if (typeof maxAmount === 'number' && num > maxAmount + 0.01) return setError('Amount exceeds outstanding');
      setIsSubmitting(true);
      await onSubmit({ invoiceId, mode, amount: num, reference, tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
      setIsSubmitting(false);
      onClose();
      // reset minimal
      setAmount(''); setReference(''); setTags('');
    } catch (e) {
      setIsSubmitting(false);
      setError(e instanceof Error ? e.message : 'Failed to record payment');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Collect Payment</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          select
          fullWidth
          label="Invoice"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          margin="dense"
        >
          {invoices.map(inv => (
            <MenuItem key={inv.id} value={inv.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{inv.customerName} • {inv.id}</span>
                <span>Due: {inv.outstanding.toFixed(2)}</span>
              </Box>
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          label="Mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as PaymentMode)}
          margin="dense"
        >
          {modes.map(m => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          type="number"
          label={`Amount${typeof maxAmount === 'number' ? ` (max ${maxAmount.toFixed(2)})` : ''}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          margin="dense"
          inputProps={{ min: 0, step: '0.01' }}
        />
        <TextField
          fullWidth
          label="Reference (optional)"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          margin="dense"
        />
        <TextField
          fullWidth
          label="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} /> : undefined}>
          Record Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;


