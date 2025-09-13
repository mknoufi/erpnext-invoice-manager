import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormGroup, FormControlLabel, Checkbox, Alert, CircularProgress } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (shareWith: string[]) => Promise<void>;
};

const EODDialog: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [shareAccounts, setShareAccounts] = useState(true);
  const [shareManagement, setShareManagement] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      const shareWith: string[] = [];
      if (shareAccounts) shareWith.push('accounts');
      if (shareManagement) shareWith.push('management');
      await onSubmit(shareWith);
      setIsSubmitting(false);
      onClose();
    } catch (e) {
      setIsSubmitting(false);
      setError(e instanceof Error ? e.message : 'Failed to generate EOD');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>End-of-Day Reconciliation</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={shareAccounts} onChange={(e) => setShareAccounts(e.target.checked)} />} label="Share with Accounts" />
          <FormControlLabel control={<Checkbox checked={shareManagement} onChange={(e) => setShareManagement(e.target.checked)} />} label="Share with Management" />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} /> : undefined}>
          Generate & Share
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EODDialog;


