import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  IconButton,
  Tooltip,
  Container,
} from '@mui/material';
import { Refresh, Payment, Receipt, CreditCard } from '@mui/icons-material';
import { format } from 'date-fns';
import { useInvoices } from '../hooks/useInvoices';
import { formatCurrency } from '../utils/formatters';
import DashboardStats from './DashboardStats';
import LoadingSkeleton from './LoadingSkeleton';
import PaymentGateway from './payments/PaymentGateway';
import logger from '../utils/logger';

const InvoiceList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unpaid' | 'Overdue'>('All');
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [paymentInvoice, setPaymentInvoice] = useState<any>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  
  const { 
    invoices, 
    isLoading, 
    error, 
    markAsPaid, 
    isMarkingPaid, 
    refetch 
  } = useInvoices(statusFilter);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(
        invoices
          .filter(invoice => !invoice.is_paid)
          .map(invoice => invoice.name)
      );
      setSelectedInvoices(newSelected);
    } else {
      setSelectedInvoices(new Set());
    }
  };

  const handleSelectOne = (invoiceName: string, isSelected: boolean) => {
    const newSelected = new Set(selectedInvoices);
    if (isSelected) {
      newSelected.add(invoiceName);
    } else {
      newSelected.delete(invoiceName);
    }
    setSelectedInvoices(newSelected);
  };

  const handleMarkSelectedAsPaid = async () => {
    if (selectedInvoices.size === 0) return;
    
    try {
      await markAsPaid(Array.from(selectedInvoices));
      setSelectedInvoices(new Set());
    } catch (error) {
      console.error('Error marking invoices as paid:', error);
    }
  };

  const handlePaymentClick = (invoice: any) => {
    setPaymentInvoice(invoice);
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    logger.info('Payment successful:', paymentData);
    setShowPaymentGateway(false);
    setPaymentInvoice(null);
    refetch(); // Refresh the invoice list
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setShowPaymentGateway(false);
    setPaymentInvoice(null);
  };

  const handleClosePaymentGateway = () => {
    setShowPaymentGateway(false);
    setPaymentInvoice(null);
  };

  const handleStatusFilter = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: 'All' | 'Unpaid' | 'Overdue' | null
  ) => {
    if (newFilter !== null) {
      setStatusFilter(newFilter);
      setSelectedInvoices(new Set());
    }
  };

  const refreshData = useCallback(() => {
    refetch();
    setSelectedInvoices(new Set());
  }, [refetch]);

  if (isLoading && invoices.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <DashboardStats />
        <Box sx={{ mt: 4 }}>
          <LoadingSkeleton variant="table" count={5} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading invoices: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <DashboardStats />
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Invoices
          </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={refreshData} disabled={isLoading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={handleStatusFilter}
            aria-label="invoice status filter"
            size="small"
          >
            <ToggleButton value="All" aria-label="all invoices">
              All
            </ToggleButton>
            <ToggleButton value="Unpaid" aria-label="unpaid invoices">
              Unpaid
            </ToggleButton>
            <ToggleButton value="Overdue" aria-label="overdue invoices">
              Overdue
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box mb={2} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Payment />}
          onClick={handleMarkSelectedAsPaid}
          disabled={selectedInvoices.size === 0 || isMarkingPaid}
        >
          {isMarkingPaid ? 'Processing...' : `Mark ${selectedInvoices.size} as Paid`}
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedInvoices.size > 0 && selectedInvoices.size < invoices.length
                  }
                  checked={invoices.length > 0 && selectedInvoices.size === invoices.length}
                  onChange={handleSelectAll}
                  inputProps={{ 'aria-label': 'select all invoices' }}
                />
              </TableCell>
              <TableCell>Invoice #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Outstanding</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <Receipt color="action" fontSize="large" />
                    <Typography color="textSecondary">
                      No {statusFilter === 'All' ? '' : statusFilter.toLowerCase()} invoices found
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow
                  key={invoice.name}
                  hover
                  selected={selectedInvoices.has(invoice.name)}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedInvoices.has(invoice.name)}
                      onChange={(e) => handleSelectOne(invoice.name, e.target.checked)}
                      disabled={invoice.is_paid}
                      inputProps={{ 'aria-label': `select invoice ${invoice.name}` }}
                    />
                  </TableCell>
                  <TableCell>{invoice.name}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
                  <TableCell>{format(new Date(invoice.posting_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell align="right">{formatCurrency(invoice.grand_total)}</TableCell>
                  <TableCell 
                    align="right"
                    sx={{
                      color: invoice.outstanding_amount > 0 ? 'error.main' : 'success.main',
                      fontWeight: 500,
                    }}
                  >
                    {formatCurrency(invoice.outstanding_amount)}
                  </TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        backgroundColor: getStatusColor(invoice.status).bg,
                        color: getStatusColor(invoice.status).text,
                      }}
                    >
                      {invoice.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {!invoice.is_paid && (
                        <Tooltip title="Process Payment">
                          <IconButton
                            size="small"
                            onClick={() => handlePaymentClick(invoice)}
                            color="primary"
                          >
                            <CreditCard />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Receipt />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>

    {/* Payment Gateway Dialog */}
    {showPaymentGateway && paymentInvoice && (
      <PaymentGateway
        invoiceId={paymentInvoice.name}
        amount={paymentInvoice.outstanding_amount}
        currency="USD"
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        onClose={handleClosePaymentGateway}
      />
    )}
    </Container>
  );
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return { bg: 'success.light', text: 'success.dark' };
    case 'overdue':
      return { bg: 'error.light', text: 'error.dark' };
    case 'unpaid':
      return { bg: 'warning.light', text: 'warning.dark' };
    case 'draft':
      return { bg: 'grey.300', text: 'grey.800' };
    default:
      return { bg: 'grey.200', text: 'grey.700' };
  }
};

export default InvoiceList;
