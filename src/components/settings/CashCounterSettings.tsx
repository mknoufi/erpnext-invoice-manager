import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';
import { CashCounterSettings as CashCounterSettingsType } from '../../types/cashier';
import logger from '../../utils/logger';

// const CASH_COUNTER_SETTINGS_KEY = 'cash_counter_settings';

const DEFAULT_SETTINGS: CashCounterSettingsType = {
  currency: 'INR',
  denominations: [2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  account_mappings: {
    cash_account: '',
    upi_account: '',
    card_account: '',
    others_account: '',
  },
  variance_threshold: 100, // ₹100
};

export const CashCounterSettings: React.FC = () => {
  const { settings, saveSettings } = useSettings();
  const [formData, setFormData] = useState<CashCounterSettingsType>(DEFAULT_SETTINGS);
  const [newDenomination, setNewDenomination] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load existing settings
    const savedSettings = settings.cashCounter || DEFAULT_SETTINGS;
    setFormData(savedSettings);
  }, [settings]);

  const handleInputChange = (field: keyof CashCounterSettingsType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAccountMappingChange = (field: keyof CashCounterSettingsType['account_mappings'], value: string) => {
    setFormData(prev => ({
      ...prev,
      account_mappings: {
        ...prev.account_mappings,
        [field]: value,
      },
    }));
  };

  const addDenomination = () => {
    const value = parseFloat(newDenomination);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid positive number');
      return;
    }
    if (formData.denominations.includes(value)) {
      setError('This denomination already exists');
      return;
    }

    const newDenominations = [...formData.denominations, value].sort((a, b) => b - a);
    setFormData(prev => ({
      ...prev,
      denominations: newDenominations,
    }));
    setNewDenomination('');
    setError('');
  };

  const removeDenomination = (value: number) => {
    const newDenominations = formData.denominations.filter(d => d !== value);
    setFormData(prev => ({
      ...prev,
      denominations: newDenominations,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.account_mappings.cash_account) {
        throw new Error('Cash account is required');
      }

      // Update settings
      saveSettings({
        cashCounter: formData,
      });

      logger.info('cash_counter_settings_saved', {
        currency: formData.currency,
        denominationsCount: formData.denominations.length,
        varianceThreshold: formData.variance_threshold,
      });

      // Show success message (you can integrate with your notification system)
      console.log('Cash counter settings saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
      logger.error('cash_counter_settings_save_failed', { error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Cash Counter Settings
      </Typography>
      
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Currency */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                >
                  <MenuItem value="INR">INR (₹)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Variance Threshold */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Variance Threshold"
                type="number"
                value={formData.variance_threshold}
                onChange={(e) => handleInputChange('variance_threshold', parseFloat(e.target.value) || 0)}
                helperText="Maximum allowed variance in currency units"
              />
            </Grid>

            {/* Denominations */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Denominations
              </Typography>
              
              <Box display="flex" gap={2} alignItems="center" mb={2}>
                <TextField
                  label="Add Denomination"
                  type="number"
                  value={newDenomination}
                  onChange={(e) => setNewDenomination(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDenomination()}
                  size="small"
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addDenomination}
                  disabled={!newDenomination}
                >
                  Add
                </Button>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.denominations.map((value) => (
                  <Chip
                    key={value}
                    label={`${formData.currency} ${value}`}
                    onDelete={() => removeDenomination(value)}
                    deleteIcon={<DeleteIcon />}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* Account Mappings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Account Mappings
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cash Account"
                value={formData.account_mappings.cash_account}
                onChange={(e) => handleAccountMappingChange('cash_account', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="UPI Account"
                value={formData.account_mappings.upi_account}
                onChange={(e) => handleAccountMappingChange('upi_account', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Card Account"
                value={formData.account_mappings.card_account}
                onChange={(e) => handleAccountMappingChange('card_account', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Others Account"
                value={formData.account_mappings.others_account}
                onChange={(e) => handleAccountMappingChange('others_account', e.target.value)}
              />
            </Grid>

            {/* Error Display */}
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            {/* Save Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                size="large"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
