import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Typography, Alert, CircularProgress } from '@mui/material';
import type { CashDenomination } from '../../types/pos';

type Props = {
  open: boolean;
  onClose: () => void;
  defaultDenoms?: number[]; // e.g., [2000,500,200,100,50,20,10,5,2,1]
  onSubmit: (payload: { denominations: CashDenomination[] }) => Promise<void>;
};

const CashInHandDialog: React.FC<Props> = ({ open, onClose, defaultDenoms = [2000,500,200,100,50,20,10,5,2,1], onSubmit }) => {
  const [rows, setRows] = useState<CashDenomination[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRows(defaultDenoms.map(v => ({ label: String(v), value: v, qty: 0 })));
      setError('');
    }
  }, [open, defaultDenoms]);

  const total = useMemo(() => rows.reduce((acc, r) => acc + r.value * (r.qty || 0), 0), [rows]);

  const handleQtyChange = (idx: number, qtyText: string) => {
    const qty = Number(qtyText || '0');
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, qty: Math.max(0, Math.floor(qty)) } : r));
  };

  const handleSave = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      await onSubmit({ denominations: rows });
      setIsSubmitting(false);
      onClose();
    } catch (e) {
      setIsSubmitting(false);
      setError(e instanceof Error ? e.message : 'Failed to save cash count');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cash-in-Hand Count</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={1}>
          {rows.map((r, idx) => (
            <React.Fragment key={r.label}>
              <Grid item xs={6} md={4}>
                <Typography variant="body2">{r.label}</Typography>
              </Grid>
              <Grid item xs={6} md={8}>
                <TextField
                  type="number"
                  size="small"
                  value={r.qty}
                  onChange={(e) => handleQtyChange(idx, e.target.value)}
                  inputProps={{ min: 0, step: 1 }}
                  fullWidth
                />
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Total: {total.toFixed(2)}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} /> : undefined}>
          Save Count
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CashInHandDialog;


