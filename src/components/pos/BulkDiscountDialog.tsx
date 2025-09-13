import React, { useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Checkbox, FormControlLabel, Alert, CircularProgress } from '@mui/material';
import type { InvoiceSummary } from '../../types/pos';

type Props = {
  open: boolean;
  onClose: () => void;
  invoices: InvoiceSummary[];
  onSubmit: (invoiceIds: string[], totalDiscount: number) => Promise<void>;
};

const BulkDiscountDialog: React.FC<Props> = ({ open, onClose, invoices, onSubmit }) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [totalDiscount, setTotalDiscount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedIds = useMemo(() => Object.keys(selected).filter(id => selected[id]), [selected]);

  const totals = useMemo(() => {
    const invs = invoices.filter(i => selectedIds.includes(i.id));
    const sumOutstanding = invs.reduce((acc, i) => acc + Math.max(i.outstanding, 0), 0);
    const sumGrand = invs.reduce((acc, i) => acc + Math.max(i.grandTotal, 0), 0);
    return { sumOutstanding, sumGrand, count: invs.length };
  }, [invoices, selectedIds]);

  const distribution = useMemo(() => {
    const td = Number(totalDiscount || '0');
    if (!td || td <= 0 || totals.count === 0) return [] as Array<{ id: string; discount: number }>;
    const invs = invoices.filter(i => selectedIds.includes(i.id));
    const base = totals.sumOutstanding || totals.sumGrand || 1;
    let remaining = td;
    const parts = invs.map((inv, idx) => {
      const raw = (Math.max(inv.outstanding, 0) || inv.grandTotal) / base * td;
      const rounded = idx === invs.length - 1 ? remaining : Math.round(raw * 100) / 100;
      remaining = Math.round((remaining - rounded) * 100) / 100;
      return { id: inv.id, discount: Math.max(0, rounded) };
    });
    return parts;
  }, [invoices, selectedIds, totalDiscount, totals]);

  const handleToggle = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      const td = Number(totalDiscount || '0');
      if (selectedIds.length === 0) return setError('Select at least one invoice');
      if (!td || td <= 0) return setError('Enter a positive discount amount');
      setIsSubmitting(true);
      await onSubmit(selectedIds, td);
      setIsSubmitting(false);
      onClose();
    } catch (e) {
      setIsSubmitting(false);
      setError(e instanceof Error ? e.message : 'Failed to apply discount');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Discount</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          fullWidth
          type="number"
          label="Total Discount"
          value={totalDiscount}
          onChange={(e) => setTotalDiscount(e.target.value)}
          margin="dense"
          inputProps={{ min: 0, step: '0.01' }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
          Selected: {selectedIds.length} • Sum Outstanding: {totals.sumOutstanding.toFixed(2)}
        </Typography>
        <Box sx={{ maxHeight: 260, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
          {invoices.map(inv => (
            <FormControlLabel
              key={inv.id}
              control={<Checkbox checked={!!selected[inv.id]} onChange={() => handleToggle(inv.id)} />}
              label={
                <Box>
                  <Typography variant="body2">{inv.customerName} • {inv.id}</Typography>
                  <Typography variant="caption" color="text.secondary">Outstanding: {inv.outstanding.toFixed(2)} • Total: {inv.grandTotal.toFixed(2)}</Typography>
                </Box>
              }
            />
          ))}
        </Box>
        {distribution.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Distribution Preview</Typography>
            {distribution.map(part => (
              <Typography key={part.id} variant="caption" display="block">
                {part.id}: −{part.discount.toFixed(2)}
              </Typography>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} /> : undefined}>
          Apply Discount
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkDiscountDialog;


