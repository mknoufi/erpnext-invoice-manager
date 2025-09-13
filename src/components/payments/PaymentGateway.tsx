import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'digital' | 'crypto';
  enabled: boolean;
  icon: React.ReactNode;
  description: string;
  processingFee: number;
  settlementTime: string;
  supportedCurrencies: string[];
}

interface PaymentGatewayProps {
  invoiceId: string;
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  onClose: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  invoiceId,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
  onClose,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentData, setPaymentData] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const loadPaymentMethods = useCallback(async () => {
    try {
      // Mock payment methods - in real implementation, fetch from API
      const methods: PaymentMethod[] = [
        {
          id: 'stripe',
          name: 'Stripe',
          type: 'card',
          enabled: true,
          icon: <CreditCardIcon />,
          description: 'Credit & Debit Cards',
          processingFee: 2.9,
          settlementTime: '2-7 days',
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        },
        {
          id: 'paypal',
          name: 'PayPal',
          type: 'digital',
          enabled: true,
          icon: <PaymentIcon />,
          description: 'PayPal & Digital Wallets',
          processingFee: 3.4,
          settlementTime: '1-3 days',
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          type: 'bank',
          enabled: true,
          icon: <BankIcon />,
          description: 'Direct Bank Transfer',
          processingFee: 0.5,
          settlementTime: '1-3 business days',
          supportedCurrencies: ['USD', 'EUR', 'GBP'],
        },
        {
          id: 'crypto',
          name: 'Cryptocurrency',
          type: 'crypto',
          enabled: false,
          icon: <PaymentIcon />,
          description: 'Bitcoin & Ethereum',
          processingFee: 1.0,
          settlementTime: '10-30 minutes',
          supportedCurrencies: ['BTC', 'ETH'],
        },
      ];
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      enqueueSnackbar('Failed to load payment methods', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setPaymentData({});
  };

  const handlePaymentDataChange = (field: string, value: any) => {
    setPaymentData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const processPayment = async () => {
    if (!selectedMethod) {
      enqueueSnackbar('Please select a payment method', { variant: 'warning' });
      return;
    }

    setIsProcessing(true);
    try {
      // Mock payment processing - in real implementation, integrate with actual payment gateways
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentResult = {
        id: `pay_${Date.now()}`,
        method: selectedMethod,
        amount,
        currency,
        status: 'completed',
        transactionId: `txn_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      onPaymentSuccess(paymentResult);
      enqueueSnackbar('Payment processed successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Payment processing error:', error);
      onPaymentError('Payment processing failed. Please try again.');
      enqueueSnackbar('Payment failed. Please try again.', { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <PaymentIcon color="primary" />
          <Typography variant="h6">Payment Gateway</Typography>
          <Chip
            label={`${currency} ${amount.toLocaleString()}`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Invoice ID: {invoiceId}
          </Typography>
          <Typography variant="h5" color="primary">
            ${amount.toLocaleString()} {currency}
          </Typography>
        </Box>

        {/* Payment Methods */}
        <Typography variant="h6" gutterBottom>
          Select Payment Method
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {paymentMethods.map((method) => (
            <Grid item xs={12} sm={6} md={4} key={method.id}>
              <Card
                sx={{
                  cursor: method.enabled ? 'pointer' : 'not-allowed',
                  opacity: method.enabled ? 1 : 0.5,
                  border: selectedMethod === method.id ? 2 : 1,
                  borderColor: selectedMethod === method.id ? 'primary.main' : 'divider',
                  '&:hover': method.enabled ? {
                    boxShadow: 4,
                  } : {},
                }}
                onClick={() => method.enabled && handlePaymentMethodSelect(method.id)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    {method.icon}
                    <Typography variant="h6">{method.name}</Typography>
                    {!method.enabled && (
                      <Chip label="Coming Soon" size="small" color="default" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {method.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      Fee: {method.processingFee}%
                    </Typography>
                    <Typography variant="body2">
                      {method.settlementTime}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Payment Form */}
        {selectedMethod && selectedMethodData && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            
            {selectedMethod === 'stripe' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber || ''}
                    onChange={(e) => handlePaymentDataChange('cardNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate || ''}
                    onChange={(e) => handlePaymentDataChange('expiryDate', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    placeholder="123"
                    value={paymentData.cvv || ''}
                    onChange={(e) => handlePaymentDataChange('cvv', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    value={paymentData.cardholderName || ''}
                    onChange={(e) => handlePaymentDataChange('cardholderName', e.target.value)}
                  />
                </Grid>
              </Grid>
            )}

            {selectedMethod === 'paypal' && (
              <Box textAlign="center" py={4}>
                <PaymentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  PayPal Payment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You will be redirected to PayPal to complete your payment
                </Typography>
              </Box>
            )}

            {selectedMethod === 'bank_transfer' && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Please transfer the amount to the following account:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Account: 1234567890<br />
                    Bank: Example Bank<br />
                    Reference: {invoiceId}
                  </Typography>
                </Alert>
                <TextField
                  fullWidth
                  label="Transaction Reference"
                  value={paymentData.transactionRef || ''}
                  onChange={(e) => handlePaymentDataChange('transactionRef', e.target.value)}
                />
              </Box>
            )}

            {/* Payment Summary */}
            <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Invoice Amount:</Typography>
                  <Typography>${amount.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Processing Fee ({selectedMethodData.processingFee}%):</Typography>
                  <Typography>${(amount * selectedMethodData.processingFee / 100).toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  <Typography>Total:</Typography>
                  <Typography>${(amount + (amount * selectedMethodData.processingFee / 100)).toFixed(2)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {isProcessing && (
          <Box mt={3}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
              Processing payment...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={processPayment}
          disabled={!selectedMethod || isProcessing}
          startIcon={isProcessing ? <RefreshIcon /> : <PaymentIcon />}
        >
          {isProcessing ? 'Processing...' : 'Process Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentGateway;
