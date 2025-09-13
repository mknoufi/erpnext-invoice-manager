import React, { useEffect, useState, useCallback, useReducer } from 'react';
import { Box, Grid, Paper, Typography, TextField, Tabs, Tab, Button, Snackbar, Alert, Checkbox, FormControlLabel } from '@mui/material';
import { useCashier } from '../contexts/CashierContext';
import { useSettings } from '../contexts/SettingsContext';
import posService from '../api/posService';
import { subscribeToDocType } from '../api/socket';
import type { InvoiceSummary } from '../types/pos';
import BulkDiscountDialog from '../components/pos/BulkDiscountDialog';
import ManagerApprovalDialog from '../components/pos/ManagerApprovalDialog';
import PaymentModal from '../components/pos/PaymentModal';
import PayoutModal from '../components/pos/PayoutModal';
import CashCollectionModal from '../components/pos/CashCollectionModal';
import CashInHandDialog from '../components/pos/CashInHandDialog';
import EODDialog from '../components/pos/EODDialog';

// Enhanced state management with useReducer
interface ModalState {
  showDiscount: boolean;
  showApproval: boolean;
  showPayment: boolean;
  showPayout: boolean;
  showCashCollection: boolean;
  showCashCount: boolean;
  showEOD: boolean;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface DashboardState {
  modals: ModalState;
  selectedInvoices: InvoiceSummary[];
  toast: ToastState;
  tab: number;
  search: string;
}

type DashboardAction =
  | { type: 'SET_MODAL'; modal: keyof ModalState; open: boolean }
  | { type: 'SET_SELECTED_INVOICES'; invoices: InvoiceSummary[] }
  | { type: 'TOGGLE_INVOICE_SELECTION'; invoice: InvoiceSummary }
  | { type: 'CLEAR_SELECTED_INVOICES' }
  | { type: 'SHOW_TOAST'; toast: Omit<ToastState, 'open'> }
  | { type: 'HIDE_TOAST' }
  | { type: 'SET_TAB'; tab: number }
  | { type: 'SET_SEARCH'; search: string };

const initialState: DashboardState = {
  modals: {
    showDiscount: false,
    showApproval: false,
    showPayment: false,
    showPayout: false,
    showCashCollection: false,
    showCashCount: false,
    showEOD: false,
  },
  selectedInvoices: [],
  toast: { open: false, message: '', severity: 'success' },
  tab: 0,
  search: '',
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.modal]: action.open,
        },
      };
    case 'SET_SELECTED_INVOICES':
      return {
        ...state,
        selectedInvoices: action.invoices,
      };
    case 'TOGGLE_INVOICE_SELECTION':
      const exists = state.selectedInvoices.find(s => s.id === action.invoice.id);
      return {
        ...state,
        selectedInvoices: exists
          ? state.selectedInvoices.filter(s => s.id !== action.invoice.id)
          : [...state.selectedInvoices, action.invoice],
      };
    case 'CLEAR_SELECTED_INVOICES':
      return {
        ...state,
        selectedInvoices: [],
      };
    case 'SHOW_TOAST':
      return {
        ...state,
        toast: { ...action.toast, open: true },
      };
    case 'HIDE_TOAST':
      return {
        ...state,
        toast: { ...state.toast, open: false },
      };
    case 'SET_TAB':
      return {
        ...state,
        tab: action.tab,
      };
    case 'SET_SEARCH':
      return {
        ...state,
        search: action.search,
      };
    default:
      return state;
  }
}

const CashierDashboard: React.FC = () => {
  const { state: cashierState } = useCashier();
  const { settings } = useSettings();
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const [todayInvoices, setTodayInvoices] = useState<InvoiceSummary[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<InvoiceSummary[]>([]);

  // Enhanced action creators for better maintainability
  const openModal = useCallback((modal: keyof ModalState) => {
    dispatch({ type: 'SET_MODAL', modal, open: true });
  }, []);

  const closeModal = useCallback((modal: keyof ModalState) => {
    dispatch({ type: 'SET_MODAL', modal, open: false });
  }, []);

  const showToast = useCallback((message: string, severity: ToastState['severity'] = 'success') => {
    dispatch({ type: 'SHOW_TOAST', toast: { message, severity } });
  }, []);

  const hideToast = useCallback(() => {
    dispatch({ type: 'HIDE_TOAST' });
  }, []);

  const toggleInvoiceSelection = useCallback((invoice: InvoiceSummary) => {
    dispatch({ type: 'TOGGLE_INVOICE_SELECTION', invoice });
  }, []);

  const clearSelectedInvoices = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED_INVOICES' });
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [inv, del] = await Promise.all([
        posService.listTodayInvoices({ search: state.search }),
        posService.listPendingDeliveries({ search: state.search }),
      ]);
      setTodayInvoices(inv);
      setPendingDeliveries(del);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load invoice data', 'error');
    }
  }, [state.search, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Realtime: refresh lists when ERPNext pushes updates
    const offInv = subscribeToDocType('Sales Invoice', () => {
      posService.listTodayInvoices({ search: state.search }).then(setTodayInvoices).catch(() => {
        showToast('Failed to update today invoices', 'warning');
      });
    });
    const offDel = subscribeToDocType('Delivery Note', () => {
      posService.listPendingDeliveries({ search: state.search }).then(setPendingDeliveries).catch(() => {
        showToast('Failed to update pending deliveries', 'warning');
      });
    });
    return () => {
      offInv();
      offDel();
    };
  }, [state.search, showToast]);

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
            onChange={(e) => dispatch({ type: 'SET_SEARCH', search: e.target.value })}
            sx={{ minWidth: 260 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          {settings.features?.posBulkDiscounts && (
            <Button variant="outlined" onClick={() => openModal('showDiscount')}>Bulk Discount</Button>
          )}
          {settings.features?.posPayments && (
            <>
              <Button variant="contained" onClick={() => openModal('showPayment')}>Collect Payment</Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => openModal('showCashCollection')}
                disabled={state.selectedInvoices.length === 0}
              >
                Cash Collection ({state.selectedInvoices.length})
              </Button>
            </>
          )}
          {settings.features?.posPayouts && (
            <Button variant="outlined" color="warning" onClick={() => openModal('showPayout')}>Record Payout</Button>
          )}
          {settings.features?.posCashInHand && (
            <Button variant="outlined" onClick={() => openModal('showCashCount')}>Cash-in-Hand</Button>
          )}
          {settings.features?.posEndOfDay && (
            <Button variant="outlined" color="success" onClick={() => openModal('showEOD')}>End of Day</Button>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Tabs value={state.tab} onChange={(_, v) => dispatch({ type: 'SET_TAB', tab: v })} variant="scrollable" allowScrollButtonsMobile>
          <Tab label={`Today Invoices (${todayInvoices.length})`} />
          <Tab label={`Pending Delivery (${pendingDeliveries.length})`} />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {state.tab === 0 && (
            <Grid container spacing={2}>
              {todayInvoices.map((inv) => (
                <Grid item xs={12} md={6} lg={4} key={inv.id}>
                  <Paper sx={{ p: 2, border: state.selectedInvoices.find(s => s.id === inv.id) ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={state.selectedInvoices.some(s => s.id === inv.id)}
                          onChange={() => toggleInvoiceSelection(inv)}
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
              {pendingDeliveries.map((inv) => (
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
      onClose={() => closeModal('showDiscount')}
      invoices={state.tab === 0 ? todayInvoices : pendingDeliveries}
      onSubmit={async (invoiceIds, totalDiscount) => {
        try {
          // Manager approval threshold (could be feature flag/setting later)
          const threshold = 1000; // example
          if (settings.features?.posManagerApproval && totalDiscount > threshold) {
            closeModal('showDiscount');
            openModal('showApproval');
            return;
          }
          const res = await posService.applyBulkDiscount(invoiceIds, totalDiscount);
          showToast(`Discount applied to ${res.updated.length} invoices`, 'success');
          closeModal('showDiscount');
        } catch (error) {
          showToast('Failed to apply bulk discount', 'error');
        }
      }}
    />
    )}
    {settings.features?.posManagerApproval && (
    <ManagerApprovalDialog
      open={state.modals.showApproval}
      onClose={() => closeModal('showApproval')}
      onApprove={async () => {
        closeModal('showApproval');
        showToast('Manager approval captured. Apply the discount from your last input.', 'info');
      }}
    />
    )}
    {settings.features?.posPayments && (
    <PaymentModal
      open={state.modals.showPayment}
      onClose={() => closeModal('showPayment')}
      invoices={state.tab === 0 ? todayInvoices : pendingDeliveries}
      onSubmit={async ({ invoiceId, mode, amount, reference, tags }) => {
        try {
          await posService.recordPayment({
            id: '',
            invoiceId,
            mode,
            amount: { currency: 'INR', value: amount },
            reference,
            tags,
            createdAt: ''
          } as any);
          showToast('Payment recorded', 'success');
          closeModal('showPayment');
          loadData(); // Refresh data
        } catch (error) {
          showToast('Failed to record payment', 'error');
        }
      }}
    />
    )}
    {settings.features?.posPayouts && (
    <PayoutModal
      open={state.modals.showPayout}
      onClose={() => closeModal('showPayout')}
      onSuccess={(payout) => {
        closeModal('showPayout');
        showToast(`Payout of $${payout.amount} recorded successfully`, 'success');
      }}
    />
    )}
    {settings.features?.posCashInHand && (
    <CashInHandDialog
      open={state.modals.showCashCount}
      onClose={() => closeModal('showCashCount')}
      onSubmit={async ({ denominations }) => {
        try {
          await posService.updateCashInHand({ denominations, sessionId: cashierState.session?.sessionId || '' } as any);
          showToast('Cash count saved', 'success');
          closeModal('showCashCount');
        } catch (error) {
          showToast('Failed to save cash count', 'error');
        }
      }}
    />
    )}
    {settings.features?.posEndOfDay && (
    <EODDialog
      open={state.modals.showEOD}
      onClose={() => closeModal('showEOD')}
      onSubmit={async (shareWith) => {
        try {
          await posService.generateEOD(cashierState.session?.sessionId || '', { shareWith });
          showToast('EOD report generated', 'success');
          closeModal('showEOD');
        } catch (error) {
          showToast('Failed to generate EOD report', 'error');
        }
      }}
    />
    )}
    {settings.features?.posPayments && (
    <CashCollectionModal
      open={state.modals.showCashCollection}
      onClose={() => closeModal('showCashCollection')}
      onSuccess={(collection) => {
        closeModal('showCashCollection');
        clearSelectedInvoices();
        showToast(`Cash collection of $${collection.totalAmount} processed successfully`, 'success');
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
    <Snackbar open={state.toast.open} autoHideDuration={4000} onClose={hideToast}>
      <Alert onClose={hideToast} severity={state.toast.severity} sx={{ width: '100%' }}>
        {state.toast.message}
      </Alert>
    </Snackbar>
    </>
  );
};

export default CashierDashboard;


