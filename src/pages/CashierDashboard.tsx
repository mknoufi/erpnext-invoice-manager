import React, { useEffect, useState, useCallback } from 'react';
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

const CashierDashboard: React.FC = () => {
  const { state } = useCashier();
  const { settings } = useSettings();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [todayInvoices, setTodayInvoices] = useState<InvoiceSummary[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<InvoiceSummary[]>([]);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [showCashCollection, setShowCashCollection] = useState(false);
  const [showCashCount, setShowCashCount] = useState(false);
  const [showEOD, setShowEOD] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<InvoiceSummary[]>([]);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  const loadData = useCallback(async () => {
    try {
      const [inv, del] = await Promise.all([
        posService.listTodayInvoices({ search }),
        posService.listPendingDeliveries({ search }),
      ]);
      setTodayInvoices(inv);
      setPendingDeliveries(del);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Realtime: refresh lists when ERPNext pushes updates
    const offInv = subscribeToDocType('Sales Invoice', () => {
      posService.listTodayInvoices({ search }).then(setTodayInvoices).catch(() => {});
    });
    const offDel = subscribeToDocType('Delivery Note', () => {
      posService.listPendingDeliveries({ search }).then(setPendingDeliveries).catch(() => {});
    });
    return () => {
      offInv();
      offDel();
    };
  }, [search]);

  return (
    <>
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h5" gutterBottom>
        Cashier Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Session: {state.session?.sessionId || '-'} • Cashier: {state.session?.cashier.name || '-'}
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search customer / phone / invoice"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 260 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          {settings.features?.posBulkDiscounts && (
            <Button variant="outlined" onClick={() => setShowDiscount(true)}>Bulk Discount</Button>
          )}
          {settings.features?.posPayments && (
            <>
              <Button variant="contained" onClick={() => setShowPayment(true)}>Collect Payment</Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setShowCashCollection(true)}
                disabled={selectedInvoices.length === 0}
              >
                Cash Collection ({selectedInvoices.length})
              </Button>
            </>
          )}
          {settings.features?.posPayouts && (
            <Button variant="outlined" color="warning" onClick={() => setShowPayout(true)}>Record Payout</Button>
          )}
          {settings.features?.posCashInHand && (
            <Button variant="outlined" onClick={() => setShowCashCount(true)}>Cash-in-Hand</Button>
          )}
          {settings.features?.posEndOfDay && (
            <Button variant="outlined" color="success" onClick={() => setShowEOD(true)}>End of Day</Button>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
          <Tab label={`Today Invoices (${todayInvoices.length})`} />
          <Tab label={`Pending Delivery (${pendingDeliveries.length})`} />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <Grid container spacing={2}>
              {todayInvoices.map((inv) => (
                <Grid item xs={12} md={6} lg={4} key={inv.id}>
                  <Paper sx={{ p: 2, border: selectedInvoices.find(s => s.id === inv.id) ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedInvoices.some(s => s.id === inv.id)}
                          onChange={() => {
                            setSelectedInvoices(prev => {
                              const exists = prev.find(s => s.id === inv.id);
                              if (exists) {
                                return prev.filter(s => s.id !== inv.id);
                              } else {
                                return [...prev, inv];
                              }
                            });
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
          {tab === 1 && (
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
      open={showDiscount}
      onClose={() => setShowDiscount(false)}
      invoices={tab === 0 ? todayInvoices : pendingDeliveries}
      onSubmit={async (invoiceIds, totalDiscount) => {
        // Manager approval threshold (could be feature flag/setting later)
        const threshold = 1000; // example
        if (settings.features?.posManagerApproval && totalDiscount > threshold) {
          setShowDiscount(false);
          setShowApproval(true);
          return;
        }
        const res = await posService.applyBulkDiscount(invoiceIds, totalDiscount);
        setToast({ open: true, message: `Discount applied to ${res.updated.length} invoices`, severity: 'success' });
      }}
    />
    )}
    {settings.features?.posManagerApproval && (
    <ManagerApprovalDialog
      open={showApproval}
      onClose={() => setShowApproval(false)}
      onApprove={async () => {
        setShowApproval(false);
        setToast({ open: true, message: 'Manager approval captured. Apply the discount from your last input.', severity: 'info' });
      }}
    />
    )}
    {settings.features?.posPayments && (
    <PaymentModal
      open={showPayment}
      onClose={() => setShowPayment(false)}
      invoices={tab === 0 ? todayInvoices : pendingDeliveries}
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
        setToast({ open: true, message: 'Payment recorded', severity: 'success' });
      }}
    />
    )}
    {settings.features?.posPayouts && (
    <PayoutModal
      open={showPayout}
      onClose={() => setShowPayout(false)}
      onSuccess={(payout) => {
        setShowPayout(false);
        setToast({ open: true, message: `Payout of $${payout.amount} recorded successfully`, severity: 'success' });
      }}
    />
    )}
    {settings.features?.posCashInHand && (
    <CashInHandDialog
      open={showCashCount}
      onClose={() => setShowCashCount(false)}
      onSubmit={async ({ denominations }) => {
        await posService.updateCashInHand({ denominations, sessionId: state.session?.sessionId || '' } as any);
        setToast({ open: true, message: 'Cash count saved', severity: 'success' });
      }}
    />
    )}
    {settings.features?.posEndOfDay && (
    <EODDialog
      open={showEOD}
      onClose={() => setShowEOD(false)}
      onSubmit={async (shareWith) => {
        await posService.generateEOD(state.session?.sessionId || '', { shareWith });
        setToast({ open: true, message: 'EOD report generated', severity: 'success' });
      }}
    />
    )}
    {settings.features?.posPayments && (
    <CashCollectionModal
      open={showCashCollection}
      onClose={() => setShowCashCollection(false)}
      onSuccess={(collection) => {
        setShowCashCollection(false);
        setSelectedInvoices([]);
        setToast({ open: true, message: `Cash collection of $${collection.totalAmount} processed successfully`, severity: 'success' });
        // Refresh invoices to show updated status
        loadData();
      }}
      selectedInvoices={selectedInvoices.map(inv => ({
        name: inv.id,
        customer_name: inv.customerName,
        outstanding_amount: inv.outstandingAmount,
        currency: inv.currency || 'USD'
      }))}
    />
    )}
    <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(prev => ({ ...prev, open: false }))}>
      <Alert onClose={() => setToast(prev => ({ ...prev, open: false }))} severity={toast.severity} sx={{ width: '100%' }}>
        {toast.message}
      </Alert>
    </Snackbar>
    </>
  );
};

export default CashierDashboard;


