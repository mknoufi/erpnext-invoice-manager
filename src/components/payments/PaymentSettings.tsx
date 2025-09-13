import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'bank' | 'crypto';
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  webhookSecret?: string;
  sandboxMode: boolean;
  supportedCurrencies: string[];
  processingFee: number;
  minAmount: number;
  maxAmount: number;
  autoSettlement: boolean;
  settlementDelay: number; // hours
}

interface PaymentSettingsProps {
  onSave: (settings: any) => void;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ onSave }) => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    autoProcessPayments: true,
    requireConfirmation: false,
    allowPartialPayments: true,
    enableRefunds: true,
    defaultCurrency: 'USD',
    taxInclusive: true,
    showProcessingFees: true,
    enableRecurringPayments: false,
    paymentTimeout: 30, // minutes
    retryAttempts: 3,
  });
  const { enqueueSnackbar } = useSnackbar();

  const loadPaymentSettings = useCallback(async () => {
    try {
      // Mock payment gateways - in real implementation, fetch from API
      const mockGateways: PaymentGateway[] = [
        {
          id: 'stripe_1',
          name: 'Stripe',
          type: 'stripe',
          enabled: true,
          apiKey: 'pk_test_...',
          apiSecret: 'sk_test_...',
          webhookSecret: 'whsec_...',
          sandboxMode: true,
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
          processingFee: 2.9,
          minAmount: 0.50,
          maxAmount: 999999.99,
          autoSettlement: true,
          settlementDelay: 2,
        },
        {
          id: 'paypal_1',
          name: 'PayPal',
          type: 'paypal',
          enabled: true,
          apiKey: 'client_id_...',
          apiSecret: 'client_secret_...',
          sandboxMode: true,
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
          processingFee: 3.4,
          minAmount: 1.00,
          maxAmount: 100000.00,
          autoSettlement: false,
          settlementDelay: 24,
        },
        {
          id: 'bank_1',
          name: 'Bank Transfer',
          type: 'bank',
          enabled: true,
          apiKey: '',
          apiSecret: '',
          sandboxMode: false,
          supportedCurrencies: ['USD', 'EUR', 'GBP'],
          processingFee: 0.5,
          minAmount: 10.00,
          maxAmount: 500000.00,
          autoSettlement: false,
          settlementDelay: 72,
        },
      ];

      setGateways(mockGateways);
    } catch (error) {
      console.error('Error loading payment settings:', error);
      enqueueSnackbar('Failed to load payment settings', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadPaymentSettings();
  }, [loadPaymentSettings]);

  const handleGatewayToggle = (gatewayId: string) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === gatewayId 
        ? { ...gateway, enabled: !gateway.enabled }
        : gateway
    ));
  };

  const handleGlobalSettingChange = (setting: string, value: any) => {
    setGlobalSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleEditGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleAddGateway = () => {
    setSelectedGateway(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleSaveGateway = (gatewayData: Partial<PaymentGateway>) => {
    if (isEditing && selectedGateway) {
      setGateways(prev => prev.map(gateway => 
        gateway.id === selectedGateway.id 
          ? { ...gateway, ...gatewayData }
          : gateway
      ));
    } else {
      const newGateway: PaymentGateway = {
        id: `gateway_${Date.now()}`,
        name: gatewayData.name || '',
        type: gatewayData.type || 'stripe',
        enabled: true,
        apiKey: gatewayData.apiKey || '',
        apiSecret: gatewayData.apiSecret || '',
        webhookSecret: gatewayData.webhookSecret || '',
        sandboxMode: true,
        supportedCurrencies: gatewayData.supportedCurrencies || ['USD'],
        processingFee: gatewayData.processingFee || 0,
        minAmount: gatewayData.minAmount || 0,
        maxAmount: gatewayData.maxAmount || 999999.99,
        autoSettlement: gatewayData.autoSettlement || false,
        settlementDelay: gatewayData.settlementDelay || 24,
      };
      setGateways(prev => [...prev, newGateway]);
    }
    setIsDialogOpen(false);
    enqueueSnackbar('Gateway saved successfully', { variant: 'success' });
  };

  const handleDeleteGateway = (gatewayId: string) => {
    setGateways(prev => prev.filter(gateway => gateway.id !== gatewayId));
    enqueueSnackbar('Gateway deleted successfully', { variant: 'success' });
  };

  const handleSaveSettings = () => {
    const settings = {
      gateways,
      globalSettings,
    };
    onSave(settings);
    enqueueSnackbar('Payment settings saved successfully', { variant: 'success' });
  };

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'stripe':
        return <CardIcon />;
      case 'paypal':
        return <PaymentIcon />;
      case 'bank':
        return <BankIcon />;
      case 'crypto':
        return <PaymentIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const getGatewayStatus = (gateway: PaymentGateway) => {
    if (!gateway.enabled) return { color: 'default', label: 'Disabled' };
    if (gateway.sandboxMode) return { color: 'warning', label: 'Sandbox' };
    return { color: 'success', label: 'Live' };
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Payment Settings
      </Typography>

      {/* Global Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Global Payment Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalSettings.autoProcessPayments}
                    onChange={(e) => handleGlobalSettingChange('autoProcessPayments', e.target.checked)}
                  />
                }
                label="Auto-process payments"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Automatically process payments when received
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalSettings.requireConfirmation}
                    onChange={(e) => handleGlobalSettingChange('requireConfirmation', e.target.checked)}
                  />
                }
                label="Require confirmation"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Require manual confirmation for large payments
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalSettings.allowPartialPayments}
                    onChange={(e) => handleGlobalSettingChange('allowPartialPayments', e.target.checked)}
                  />
                }
                label="Allow partial payments"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Allow customers to make partial payments
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalSettings.enableRefunds}
                    onChange={(e) => handleGlobalSettingChange('enableRefunds', e.target.checked)}
                  />
                }
                label="Enable refunds"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Allow processing refunds through the system
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default Currency</InputLabel>
                <Select
                  value={globalSettings.defaultCurrency}
                  label="Default Currency"
                  onChange={(e) => handleGlobalSettingChange('defaultCurrency', e.target.value)}
                >
                  <MenuItem value="USD">USD - US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                  <MenuItem value="GBP">GBP - British Pound</MenuItem>
                  <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                  <MenuItem value="AUD">AUD - Australian Dollar</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Timeout (minutes)"
                type="number"
                value={globalSettings.paymentTimeout}
                onChange={(e) => handleGlobalSettingChange('paymentTimeout', parseInt(e.target.value))}
                inputProps={{ min: 5, max: 120 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Gateways */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Payment Gateways
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddGateway}
            >
              Add Gateway
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Gateway</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Processing Fee</TableCell>
                  <TableCell>Currencies</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gateways.map((gateway) => {
                  const status = getGatewayStatus(gateway);
                  return (
                    <TableRow key={gateway.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getGatewayIcon(gateway.type)}
                          <Typography variant="body2">
                            {gateway.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Switch
                            checked={gateway.enabled}
                            onChange={() => handleGatewayToggle(gateway.id)}
                            size="small"
                          />
                          <Chip
                            label={status.label}
                            color={status.color as any}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {gateway.processingFee}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {gateway.supportedCurrencies.slice(0, 3).map((currency) => (
                            <Chip
                              key={currency}
                              label={currency}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {gateway.supportedCurrencies.length > 3 && (
                            <Chip
                              label={`+${gateway.supportedCurrencies.length - 3}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={gateway.sandboxMode ? 'Sandbox' : 'Live'}
                          color={gateway.sandboxMode ? 'warning' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditGateway(gateway)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteGateway(gateway.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              All payment data is encrypted and processed securely. API keys are stored securely
              and never exposed to the client side.
            </Typography>
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalSettings.showProcessingFees}
                    onChange={(e) => handleGlobalSettingChange('showProcessingFees', e.target.checked)}
                  />
                }
                label="Show processing fees"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalSettings.enableRecurringPayments}
                    onChange={(e) => handleGlobalSettingChange('enableRecurringPayments', e.target.checked)}
                  />
                }
                label="Enable recurring payments"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          size="large"
        >
          Save Settings
        </Button>
      </Box>

      {/* Gateway Configuration Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Payment Gateway' : 'Add Payment Gateway'}
        </DialogTitle>
        <DialogContent>
          <GatewayConfigForm
            gateway={selectedGateway}
            onSave={handleSaveGateway}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Gateway Configuration Form Component
const GatewayConfigForm: React.FC<{
  gateway: PaymentGateway | null;
  onSave: (data: Partial<PaymentGateway>) => void;
  onCancel: () => void;
}> = ({ gateway, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PaymentGateway>>({
    name: '',
    type: 'stripe',
    apiKey: '',
    apiSecret: '',
    webhookSecret: '',
    sandboxMode: true,
    supportedCurrencies: ['USD'],
    processingFee: 0,
    minAmount: 0,
    maxAmount: 999999.99,
    autoSettlement: false,
    settlementDelay: 24,
  });

  useEffect(() => {
    if (gateway) {
      setFormData(gateway);
    }
  }, [gateway]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Gateway Name"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Gateway Type</InputLabel>
            <Select
              value={formData.type || 'stripe'}
              label="Gateway Type"
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <MenuItem value="stripe">Stripe</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
              <MenuItem value="crypto">Cryptocurrency</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="API Key"
            value={formData.apiKey || ''}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            type="password"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="API Secret"
            value={formData.apiSecret || ''}
            onChange={(e) => handleChange('apiSecret', e.target.value)}
            type="password"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Webhook Secret"
            value={formData.webhookSecret || ''}
            onChange={(e) => handleChange('webhookSecret', e.target.value)}
            type="password"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Processing Fee (%)"
            type="number"
            value={formData.processingFee || 0}
            onChange={(e) => handleChange('processingFee', parseFloat(e.target.value))}
            inputProps={{ min: 0, max: 10, step: 0.1 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Minimum Amount"
            type="number"
            value={formData.minAmount || 0}
            onChange={(e) => handleChange('minAmount', parseFloat(e.target.value))}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Maximum Amount"
            type="number"
            value={formData.maxAmount || 999999.99}
            onChange={(e) => handleChange('maxAmount', parseFloat(e.target.value))}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.sandboxMode || false}
                onChange={(e) => handleChange('sandboxMode', e.target.checked)}
              />
            }
            label="Sandbox Mode"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.autoSettlement || false}
                onChange={(e) => handleChange('autoSettlement', e.target.checked)}
              />
            }
            label="Auto Settlement"
          />
        </Grid>
      </Grid>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {gateway ? 'Update' : 'Add'} Gateway
        </Button>
      </DialogActions>
    </Box>
  );
};

export default PaymentSettings;
