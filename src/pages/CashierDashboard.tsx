import React, { useEffect, useCallback } from 'react';
import { Box, Grid, Paper, Typography, TextField, Tabs, Tab, Button, Snackbar, Alert, Checkbox, FormControlLabel } from '@mui/material';
import { useCashier } from '../contexts/CashierContext';
import { useSettings } from '../contexts/SettingsContext';
import posService from '../api/posService';
import { subscribeToDocType } from '../api/socket';
import BulkDiscountDialog from '../components/pos/BulkDiscountDialog';
import ManagerApprovalDialog from '../components/pos/ManagerApprovalDialog';
import PaymentModal from '../components/pos/PaymentModal';
import PayoutModal from '../components/pos/PayoutModal';
import CashCollectionModal from '../components/pos/CashCollectionModal';
import CashInHandDialog from '../components/pos/CashInHandDialog';
import EODDialog from '../components/pos/EODDialog';
import { useCashierDashboard } from './cashierDashboardReducer';

const CashierDashboard: React.FC = () => {
  const { state: cashierState } = useCashier();
  const { settings } = useSettings();
  const { state, actions } = useCashierDashboard();

  const loadData = useCallback(async () => {
    try {
      actions.setLoading('data', true);
      const [inv, del] = await Promise.all([
        posService.listTodayInvoices({ search: state.search }),
        posService.listPendingDeliveries({ search: state.search }),
      ]);
      actions.setTodayInvoices(inv);
      actions.setPendingDeliveries(del);
    } catch (error) {
      console.error('Error loading data:', error);
      actions.showToast({
        message: 'Failed to load data',
        severity: 'error'
      });
    } finally {
      actions.setLoading('data', false);
    }
  }, [state.search, actions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Realtime: refresh lists when ERPNext pushes updates
    const offInv = subscribeToDocType('Sales Invoice', () => {
      posService.listTodayInvoices({ search: state.search }).then(actions.setTodayInvoices).catch(() => {});
    });
    const offDel = subscribeToDocType('Delivery Note', () => {
      posService.listPendingDeliveries({ search: state.search }).then(actions.setPendingDeliveries).catch(() => {});
    });
    return () => {
      offInv();
      offDel();
    };
  }, [state.search, actions]);

  return (
    <>
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h5" gutterBottom>
        Cashier Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Session: {cashierState.session?.sessionId || '-'} • Cashier: {cashierState.session?.cashier.name || '-'}
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search customer / phone / invoice"
            value={state.search}
            onChange={(e) => actions.setSearch(e.target.value)}
            sx={{ minWidth: 260 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          {settings.features?.posBulkDiscounts && (
            <Button variant="outlined" onClick={() => actions.showModal('showDiscount')}>Bulk Discount</Button>
          )}
          {settings.features?.posPayments && (
            <>
              <Button variant="contained" onClick={() => actions.showModal('showPayment')}>Collect Payment</Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => actions.showModal('showCashCollection')}
                disabled={state.selectedInvoices.length === 0}
              >
                Cash Collection ({state.selectedInvoices.length})
              </Button>
            </>
          )}
          {settings.features?.posPayouts && (
            <Button variant="outlined" color="warning" onClick={() => actions.showModal('showPayout')}>Record Payout</Button>
          )}
          {settings.features?.posCashInHand && (
            <Button variant="outlined" onClick={() => actions.showModal('showCashCount')}>Cash-in-Hand</Button>
          )}
          {settings.features?.posEndOfDay && (
            <Button variant="outlined" color="success" onClick={() => actions.showModal('showEOD')}>End of Day</Button>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Tabs value={state.tab} onChange={(_, v) => actions.setTab(v)} variant="scrollable" allowScrollButtonsMobile>
          <Tab label={`Today Invoices (${state.todayInvoices.length})`} />
          <Tab label={`Pending Delivery (${state.pendingDeliveries.length})`} />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {state.tab === 0 && (
            <Grid container spacing={2}>
              {state.todayInvoices.map((inv) => (
                <Grid item xs={12} md={6} lg={4} key={inv.id}>
                  <Paper sx={{ p: 2, border: state.selectedInvoices.find(s => s.id === inv.id) ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={state.selectedInvoices.some(s => s.id === inv.id)}
                          onChange={() => {
                            const exists = state.selectedInvoices.find(s => s.id === inv.id);
                            if (exists) {
                              actions.setSelectedInvoices(state.selectedInvoices.filter(s => s.id !== inv.id));
                            } else {
                              actions.setSelectedInvoices([...state.selectedInvoices, inv]);
                            }
                          }}
                        />
                      }
                      label=""
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="subtitle1">{inv.customerName}</Typography>
                    <Typography variant="body2" color="text.secondary">{inv.id} • {inv.status}</Typography>
                    <Typography variant="body2">Total: {inv.grandTotal.toFixed(2)}</Typography>
                    <Typography variant="body2">Outstanding: {inv.outstanding.toFixed(2)}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
          {state.tab === 1 && (
            <Grid container spacing={2}>
              {state.pendingDeliveries.map((inv) => (
                <Grid item xs={12} md={6} lg={4} key={inv.id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1">{inv.customerName}</Typography>
                    <Typography variant="body2" color="text.secondary">{inv.id} • {inv.status}</Typography>
                    <Typography variant="body2">Total: {inv.grandTotal.toFixed(2)}</Typography>
                    <Typography variant="body2">Outstanding: {inv.outstanding.toFixed(2)}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
    {settings.features?.posBulkDiscounts && (
    <BulkDiscountDialog
      open={state.modals.showDiscount}
      onClose={() => actions.hideModal('showDiscount')}
      invoices={state.tab === 0 ? state.todayInvoices : state.pendingDeliveries}
      onSubmit={async (invoiceIds, totalDiscount) => {
        // Manager approval threshold (could be feature flag/setting later)
        const threshold = 1000; // example
        if (settings.features?.posManagerApproval && totalDiscount > threshold) {
          actions.hideModal('showDiscount');
          actions.showModal('showApproval');
          return;
        }
        const res = await posService.applyBulkDiscount(invoiceIds, totalDiscount);
        actions.showToast({ message: `Discount applied to ${res.updated.length} invoices`, severity: 'success' });
      }}
    />
    )}
    {settings.features?.posManagerApproval && (
    <ManagerApprovalDialog
      open={state.modals.showApproval}
      onClose={() => actions.hideModal('showApproval')}
      onApprove={async () => {
        actions.hideModal('showApproval');
        actions.showToast({ message: 'Manager approval captured. Apply the discount from your last input.', severity: 'info' });
      }}
    />
    )}
    {settings.features?.posPayments && (
    <PaymentModal
      open={state.modals.showPayment}
      onClose={() => actions.hideModal('showPayment')}
      invoices={state.tab === 0 ? state.todayInvoices : state.pendingDeliveries}
      onSubmit={async ({ invoiceId, mode, amount, reference, tags }) => {
        await posService.recordPayment({
          id: '',
          invoiceId,
          mode,
          amount: { currency: 'INR', value: amount },
          reference,
          tags,
          createdAt: ''
        } as any);
        actions.showToast({ message: 'Payment recorded', severity: 'success' });
      }}
    />
    )}
    {settings.features?.posPayouts && (
    <PayoutModal
      open={state.modals.showPayout}
      onClose={() => actions.hideModal('showPayout')}
      onSuccess={(payout) => {
        actions.hideModal('showPayout');
        actions.showToast({ message: `Payout of $${payout.amount} recorded successfully`, severity: 'success' });
      }}
    />
    )}
    {settings.features?.posCashInHand && (
    <CashInHandDialog
      open={state.modals.showCashCount}
      onClose={() => actions.hideModal('showCashCount')}
      onSubmit={async ({ denominations }) => {
        await posService.updateCashInHand({ denominations, sessionId: cashierState.session?.sessionId || '' } as any);
        actions.showToast({ message: 'Cash count saved', severity: 'success' });
      }}
    />
    )}
    {settings.features?.posEndOfDay && (
    <EODDialog
      open={state.modals.showEOD}
      onClose={() => actions.hideModal('showEOD')}
      onSubmit={async (shareWith) => {
        await posService.generateEOD(cashierState.session?.sessionId || '', { shareWith });
        actions.showToast({ message: 'EOD report generated', severity: 'success' });
      }}
    />
    )}
    {settings.features?.posPayments && (
    <CashCollectionModal
      open={state.modals.showCashCollection}
      onClose={() => actions.hideModal('showCashCollection')}
      onSuccess={(collection) => {
        actions.hideModal('showCashCollection');
        actions.setSelectedInvoices([]);
        actions.showToast({ message: `Cash collection of $${collection.totalAmount} processed successfully`, severity: 'success' });
        // Refresh invoices to show updated status
        loadData();
      }}
      selectedInvoices={state.selectedInvoices.map(inv => ({
        name: inv.id,
        customer_name: inv.customerName,
        outstanding_amount: inv.outstandingAmount,
        currency: inv.currency || 'USD'
      }))}
    />
    )}
    <Snackbar open={state.toast.open} autoHideDuration={4000} onClose={() => actions.hideToast()}>
      <Alert onClose={() => actions.hideToast()} severity={state.toast.severity} sx={{ width: '100%' }}>
        {state.toast.message}
      </Alert>
    </Snackbar>
    </>
  );
};

export default CashierDashboard;


