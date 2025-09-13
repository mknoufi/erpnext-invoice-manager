import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, CircularProgress } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  onApprove: (managerPin: string, note?: string) => Promise<void>;
};

const ManagerApprovalDialog: React.FC<Props> = ({ open, onClose, onApprove }) => {
  const [pin, setPin] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    try {
      setError('');
      if (pin.length < 4) return setError('Enter manager PIN');
      setIsSubmitting(true);
      await onApprove(pin, note);
      setIsSubmitting(false);
      onClose();
    } catch (e) {
      setIsSubmitting(false);
      setError(e instanceof Error ? e.message : 'Approval failed');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Manager Approval Required</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          fullWidth
          type="password"
          label="Manager PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          margin="dense"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        />
        <TextField
          fullWidth
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          margin="dense"
          multiline
          minRows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleApprove} disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} /> : undefined}>
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManagerApprovalDialog;


