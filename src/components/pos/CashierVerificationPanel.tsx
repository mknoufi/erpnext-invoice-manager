import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPendingCashierCloses, 
  verifyCashierClose, 
  rejectCashierClose,
  getCashierClose 
} from '../../api/cashierService';
import { CashierCloseResponse } from '../../types/cashier';
import { formatCurrency } from '../../utils/cashierUtils';
import logger from '../../utils/logger';
import telemetryService from '../../services/telemetryService';

interface CashierVerificationPanelProps {
  onRefresh?: () => void;
}

interface VerificationDialogProps {
  open: boolean;
  onClose: () => void;
  cashierClose: CashierCloseResponse | null;
  onApprove: (id: string) => void;
  onReject: (id: string, notes: string) => void;
  loading: boolean;
}

const VerificationDialog: React.FC<VerificationDialogProps> = ({
  open,
  onClose,
  cashierClose,
  onApprove,
  onReject,
  loading,
}) => {
  const [notes, setNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (open) {
      setNotes('');
      setShowRejectForm(false);
    }
  }, [open]);

  const handleApprove = () => {
    if (cashierClose) {
      onApprove(cashierClose.id);
    }
  };

  const handleReject = () => {
    if (cashierClose) {
      onReject(cashierClose.id, notes);
    }
  };

  if (!cashierClose) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Cashier Close Verification</Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {cashierClose.id}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Summary */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transaction Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={cashierClose.status.toUpperCase()} 
                      color={cashierClose.status === 'verified' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {new Date(cashierClose.created_at).toLocaleString()}
                    </Typography>
                  </Grid>
                  {cashierClose.variance !== undefined && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Variance
                      </Typography>
                      <Typography 
                        variant="body1" 
                        color={cashierClose.variance === 0 ? 'success.main' : 'warning.main'}
                      >
                        {formatCurrency(cashierClose.variance)}
                      </Typography>
                    </Grid>
                  )}
                  {cashierClose.journal_entry_id && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Journal Entry
                      </Typography>
                      <Typography variant="body1" color="primary">
                        {cashierClose.journal_entry_id}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Rejection Form */}
          {showRejectForm && (
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Please provide a reason for rejection
              </Alert>
              <TextField
                fullWidth
                label="Rejection Reason"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain why this cashier close is being rejected..."
                required
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {!showRejectForm ? (
          <>
            <Button
              variant="outlined"
              color="error"
              startIcon={<RejectIcon />}
              onClick={() => setShowRejectForm(true)}
              disabled={loading}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={loading ? <CircularProgress size={20} /> : <ApproveIcon />}
              onClick={handleApprove}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Approve & Post'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setShowRejectForm(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={loading ? <CircularProgress size={20} /> : <RejectIcon />}
              onClick={handleReject}
              disabled={loading || !notes.trim()}
            >
              {loading ? 'Processing...' : 'Confirm Rejection'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export const CashierVerificationPanel: React.FC<CashierVerificationPanelProps> = ({
  onRefresh,
}) => {
  const [selectedClose, setSelectedClose] = useState<CashierCloseResponse | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pending cashier closes
  const {
    data: pendingCloses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pendingCashierCloses'],
    queryFn: getPendingCashierCloses,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: verifyCashierClose,
    onSuccess: async (data) => {
      logger.info('cashier_close_verified', {
        id: data.id,
        journalEntryId: data.journal_entry_id,
      });
      
      // Track audit event
      await telemetryService.trackCashierCloseVerified({
        cashierId: `cashier_${data.id.split('_')[1]}`, // Extract from ID
        closeId: data.id,
        journalEntryId: data.journal_entry_id || '',
        expectedAmount: 0, // Would need to fetch from close details
        countedAmount: 0, // Would need to fetch from close details
        variance: data.variance || 0,
      });
      
      queryClient.invalidateQueries({ queryKey: ['pendingCashierCloses'] });
      setVerificationDialogOpen(false);
      setSelectedClose(null);
      onRefresh?.();
    },
    onError: (error) => {
      logger.error('cashier_close_verification_failed', { error });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: rejectCashierClose,
    onSuccess: async (data) => {
      logger.info('cashier_close_rejected', {
        id: data.id,
      });
      
      // Track audit event
      await telemetryService.trackCashierCloseRejected({
        cashierId: `cashier_${data.id.split('_')[1]}`, // Extract from ID
        closeId: data.id,
        rejectionReason: 'Rejected by accountant', // Would come from form
        expectedAmount: 0, // Would need to fetch from close details
        countedAmount: 0, // Would need to fetch from close details
        variance: data.variance || 0,
      });
      
      queryClient.invalidateQueries({ queryKey: ['pendingCashierCloses'] });
      setVerificationDialogOpen(false);
      setSelectedClose(null);
      onRefresh?.();
    },
    onError: (error) => {
      logger.error('cashier_close_rejection_failed', { error });
    },
  });

  const handleViewDetails = (cashierClose: CashierCloseResponse) => {
    setSelectedClose(cashierClose);
    setVerificationDialogOpen(true);
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string, notes: string) => {
    rejectMutation.mutate({ id, action: 'reject', notes });
  };

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  const loading = approveMutation.isPending || rejectMutation.isPending;

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load pending cashier closes: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Cashier Close Verification
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : pendingCloses.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No pending cashier closes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All cashier closes have been processed
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Cashier ID</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Variance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingCloses.map((close) => (
                <TableRow key={close.id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {close.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {/* In a real implementation, we'd fetch and display cashier name */}
                    Cashier {close.id.split('_')[1]}
                  </TableCell>
                  <TableCell>
                    {new Date(close.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Typography
                      color={close.variance === 0 ? 'success.main' : 'warning.main'}
                    >
                      {formatCurrency(close.variance || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={close.status.toUpperCase()}
                      color={close.status === 'verified' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewDetails(close)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <VerificationDialog
        open={verificationDialogOpen}
        onClose={() => setVerificationDialogOpen(false)}
        cashierClose={selectedClose}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={loading}
      />
    </Box>
  );
};
