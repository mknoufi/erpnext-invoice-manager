import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  timestamp: string;
  customerName: string;
  customerEmail: string;
  processingFee: number;
  netAmount: number;
  gateway: string;
  reference?: string;
}

interface PaymentHistoryProps {
  invoiceId?: string;
  onPaymentSelect?: (payment: Payment) => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  invoiceId,
  onPaymentSelect,
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      // Mock payment data - in real implementation, fetch from API
      const mockPayments: Payment[] = [
        {
          id: 'pay_001',
          invoiceId: 'INV-2024-001',
          amount: 1500.00,
          currency: 'USD',
          method: 'Credit Card',
          status: 'completed',
          transactionId: 'txn_123456789',
          timestamp: '2024-01-15T10:30:00Z',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          processingFee: 43.50,
          netAmount: 1456.50,
          gateway: 'Stripe',
        },
        {
          id: 'pay_002',
          invoiceId: 'INV-2024-002',
          amount: 2500.00,
          currency: 'USD',
          method: 'PayPal',
          status: 'completed',
          transactionId: 'txn_987654321',
          timestamp: '2024-01-14T14:20:00Z',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          processingFee: 85.00,
          netAmount: 2415.00,
          gateway: 'PayPal',
        },
        {
          id: 'pay_003',
          invoiceId: 'INV-2024-003',
          amount: 800.00,
          currency: 'USD',
          method: 'Bank Transfer',
          status: 'pending',
          transactionId: 'txn_456789123',
          timestamp: '2024-01-13T09:15:00Z',
          customerName: 'Bob Johnson',
          customerEmail: 'bob@example.com',
          processingFee: 4.00,
          netAmount: 796.00,
          gateway: 'Bank Transfer',
          reference: 'REF123456',
        },
        {
          id: 'pay_004',
          invoiceId: 'INV-2024-004',
          amount: 1200.00,
          currency: 'USD',
          method: 'Credit Card',
          status: 'failed',
          transactionId: 'txn_789123456',
          timestamp: '2024-01-12T16:45:00Z',
          customerName: 'Alice Brown',
          customerEmail: 'alice@example.com',
          processingFee: 0,
          netAmount: 0,
          gateway: 'Stripe',
        },
        {
          id: 'pay_005',
          invoiceId: 'INV-2024-005',
          amount: 3000.00,
          currency: 'USD',
          method: 'Credit Card',
          status: 'refunded',
          transactionId: 'txn_321654987',
          timestamp: '2024-01-11T11:30:00Z',
          customerName: 'Charlie Wilson',
          customerEmail: 'charlie@example.com',
          processingFee: 87.00,
          netAmount: 2913.00,
          gateway: 'Stripe',
        },
      ];

      const filtered = invoiceId 
        ? mockPayments.filter(p => p.invoiceId === invoiceId)
        : mockPayments;

      setPayments(filtered);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  const filterPayments = useCallback(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.method === methodFilter);
    }

    setFilteredPayments(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [payments, searchTerm, statusFilter, methodFilter]);

  useEffect(() => {
    loadPayments();
  }, [invoiceId, loadPayments]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, methodFilter, filterPayments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'refunded':
        return <RefreshIcon color="info" />;
      default:
        return <PaymentIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Credit Card':
        return <CardIcon />;
      case 'Bank Transfer':
        return <BankIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    if (onPaymentSelect) {
      onPaymentSelect(payment);
    }
  };

  const handleCloseDetails = () => {
    setSelectedPayment(null);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export payments');
  };

  const paginatedPayments = filteredPayments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Payment History
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadPayments} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <FormControl fullWidth>
                <InputLabel>Method</InputLabel>
                <Select
                  value={methodFilter}
                  label="Method"
                  onChange={(e) => setMethodFilter(e.target.value)}
                >
                  <MenuItem value="all">All Methods</MenuItem>
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="PayPal">PayPal</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Payment ID</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPayments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {payment.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payment.invoiceId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {payment.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.customerEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ${payment.amount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Net: ${payment.netAmount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getMethodIcon(payment.method)}
                      <Typography variant="body2">
                        {payment.method}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(payment.status)}
                      label={payment.status}
                      color={getStatusColor(payment.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(payment.timestamp), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(payment.timestamp), 'HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handlePaymentClick(payment)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedPayment && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <PaymentIcon color="primary" />
                <Typography variant="h6">Payment Details</Typography>
                <Chip
                  icon={getStatusIcon(selectedPayment.status)}
                  label={selectedPayment.status}
                  color={getStatusColor(selectedPayment.status) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Payment Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Payment ID:</Typography>
                      <Typography variant="body2" fontFamily="monospace">{selectedPayment.id}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Transaction ID:</Typography>
                      <Typography variant="body2" fontFamily="monospace">{selectedPayment.transactionId}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Invoice ID:</Typography>
                      <Typography variant="body2">{selectedPayment.invoiceId}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Gateway:</Typography>
                      <Typography variant="body2">{selectedPayment.gateway}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Date:</Typography>
                      <Typography variant="body2">
                        {format(new Date(selectedPayment.timestamp), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Customer Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Name:</Typography>
                      <Typography variant="body2">{selectedPayment.customerName}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Email:</Typography>
                      <Typography variant="body2">{selectedPayment.customerEmail}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Financial Details
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Amount:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${selectedPayment.amount.toLocaleString()} {selectedPayment.currency}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Processing Fee:</Typography>
                      <Typography variant="body2">
                        ${selectedPayment.processingFee.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Net Amount:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${selectedPayment.netAmount.toLocaleString()}
                      </Typography>
                    </Box>
                    {selectedPayment.reference && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Reference:</Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {selectedPayment.reference}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PaymentHistory;
