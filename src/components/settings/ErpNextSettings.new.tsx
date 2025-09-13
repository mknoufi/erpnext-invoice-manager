import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import type { ErpNextSettings as ErpNextSettingsType } from '../../types/erpnext-settings';
import { 
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  AlertTitle,
  Avatar
} from '@mui/material';
import type { ErpNextSettings as BaseErpNextSettings, TestResult, LedgerItem } from '../../types/erpnext';
import { 
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
// Extend the base interface to include additional properties
interface ExtendedErpNextSettings extends Omit<BaseErpNextSettings, 'defaultLedgers'> {
  defaultLedgers?: LedgerItem[];
  syncInterval?: number;
  verifySSL?: boolean;
  connectionTimeout?: number;
}

// Helper function to convert string[] to LedgerItem[]
const toLedgerItems = (items?: string[] | LedgerItem[]): LedgerItem[] => {
  if (!items) return [];
  return items.map(item => 
    typeof item === 'string' 
      ? { name: item, account_name: item } 
      : item
  );
};

// Helper function to convert LedgerItem[] to string[]
const toStringArray = (items: LedgerItem[]): string[] => {
  return items.map(item => item.name || item.account_name);
};

// Default form values
const DEFAULT_FORM_VALUES: ExtendedErpNextSettings = {
  // Connection
  url: '',
  apiKey: '',
  apiSecret: '',
  company: '',
  defaultLedgers: [],
  syncInterval: 60, // minutes
  verifySSL: true,
  connectionTimeout: 30000, // ms
  version: 'v15',
  
  // Authentication
  authMethod: 'api_key',
  oauthConfig: {
    clientId: '',
    clientSecret: '',
    authUrl: '',
    tokenUrl: '',
    scopes: ['all']
  },
  
  // Sync Configuration
  syncDirection: 'bidirectional',
  syncSchedule: {
    enabled: true,
    interval: 15, // minutes
    startTime: '09:00',
    endTime: '17:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    excludeHolidays: true,
    maxRetryAttempts: 3,
    retryDelay: 5, // minutes
    batchSize: 100,
    priority: 'normal' as const
  },
  conflictResolution: 'source',
  fieldMappings: [],
  fieldGroups: [],
  
  // Webhook Configuration
  webhook: {
    enabled: false,
    url: '',
    events: [],
    secret: '',
    timeout: 30, // seconds
    retryPolicy: {
      enabled: true,
      maxRetries: 3,
      retryInterval: 60, // seconds
      backoffMultiplier: 2
    },
    active: false
  },
  
  // API Configuration
  apiConfig: {
    basePath: '/api/resource',
    version: 'v1',
    timeout: 30, // seconds
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 5, // seconds
      backoffFactor: 2
    },
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 60,
      throttleDelay: 1000 // ms
    },
    compression: true,
    keepAlive: true
  },
  
  // Security Settings
  security: {
    verifySSL: true,
    enableCORS: true,
    allowedOrigins: [],
    enableCSRF: true,
    dataEncryption: {
      enabled: true,
      algorithm: 'aes-256-gcm',
      keyRotationDays: 90
    },
    ipWhitelist: [],
    userAgentFiltering: false
  },
  
  // Performance Settings
  performance: {
    enableQueryOptimization: true,
    enableCompression: true,
    maxConcurrentRequests: 10,
    requestTimeout: 30, // seconds
    cacheStrategy: 'memory',
    batchProcessing: {
      enabled: true,
      size: 100,
      delay: 1000 // ms
    }
  },
  
  // Monitoring Settings
  monitoring: {
    enableHealthChecks: true,
    healthCheckInterval: 5, // minutes
    enableMetrics: true,
    metricsEndpoint: '/metrics',
    enableAlerting: true,
    alertThresholds: {
      errorRate: 5, // percentage
      responseTime: 1000, // ms
      queueSize: 1000
    }
  },
  
  // Logging Configuration
  logging: {
    level: 'info',
    enableRequestLogging: true,
    enableAuditLogging: true,
    logRetentionDays: 30,
    logFormat: 'json',
    logToConsole: true,
    logToFile: false,
    logFilePath: '/var/log/erpnext-integration.log'
  },
  
  // Caching Configuration
  caching: {
    enabled: true,
    provider: 'memory',
    ttl: 3600, // 1 hour in seconds
    namespaced: true,
    namespace: 'erpnext',
    encryption: true,
    compression: true
  },
  
  // Error Handling
  errorHandling: {
    autoRetryFailed: true,
    maxRetryAttempts: 3,
    retryDelay: 5, // minutes
    notifyOnFailure: true,
    notificationChannels: ['email'],
    notificationEmail: '',
    slackWebhookUrl: '',
    customWebhookUrl: ''
  },
  
  // Advanced Settings
  advanced: {
    enableDebugMode: false,
    enableProfiling: false,
    enableQueryLogging: false,
    enablePerformanceMetrics: true,
    customHeaders: {},
    customParameters: {},
    plugins: [],
    featureFlags: {}
  },
  
  // Metadata
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    version: '1.0.0',
    tags: ['erpnext', 'integration']
  }
};

const ErpNextSettings: React.FC = () => {
  const { settings, saveSettings } = useSettings();
  
  // Initialize form data with proper type conversion
  const getInitialFormData = () => {
    const erpSettings = settings.erpnext || {};
    return {
      ...DEFAULT_FORM_VALUES,
      ...erpSettings,
      defaultLedgers: toLedgerItems(erpSettings.defaultLedgers as any)
    };
  };
  
  const [formData, setFormData] = useState<ExtendedErpNextSettings>(getInitialFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle nested field changes
  const handleNestedChange = (
    section: keyof ExtendedErpNextSettings, 
    field: string, 
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value
      }
    }));
  };

  // Save settings
  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Convert LedgerItem[] to string[] for saving and ensure it's always an array
      const defaultLedgers = formData.defaultLedgers || [];
      const defaultLedgerStrings = defaultLedgers.map(item => item.name || item.account_name);
      
      // Prepare settings to save with proper types
      const settingsToSave: ErpNextSettingsType = {
        ...formData,
        // Ensure required fields have values
        url: formData.url || '',
        apiKey: formData.apiKey || '',
        apiSecret: formData.apiSecret || '',
        company: formData.company || '',
        version: formData.version || '1.0.0',
        authMethod: formData.authMethod || 'api_key',
        syncDirection: formData.syncDirection || 'bidirectional',
conflictResolution: formData.conflictResolution || 'source',
        defaultLedgers: defaultLedgerStrings,
        
        // Optional fields with defaults if not present
        oauthConfig: formData.oauthConfig,
        syncSchedule: formData.syncSchedule || {
          enabled: false,
          interval: 3600, // 1 hour
          startTime: '00:00',
          endTime: '23:59',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          daysOfWeek: [1, 2, 3, 4, 5], // Weekdays
          excludeHolidays: true,
          maxRetryAttempts: 3,
          retryDelay: 300, // 5 minutes
          batchSize: 100,
          priority: 'normal' as const
        },
        fieldMappings: formData.fieldMappings || [],
        fieldGroups: formData.fieldGroups || [],
        webhook: formData.webhook,
        apiConfig: formData.apiConfig,
        security: formData.security,
        performance: formData.performance,
        monitoring: formData.monitoring,
        logging: formData.logging,
        caching: formData.caching,
        errorHandling: formData.errorHandling,
        advanced: formData.advanced,
        metadata: {
          ...formData.metadata,
          updatedAt: new Date(),
          updatedBy: 'current-user' // TODO: Replace with actual user
        },
        
        // Additional custom fields
        ...(formData.syncInterval && { syncInterval: formData.syncInterval }),
        ...(formData.verifySSL !== undefined && { verifySSL: formData.verifySSL }),
        ...(formData.connectionTimeout && { connectionTimeout: formData.connectionTimeout })
      };
      
      // Ensure all required fields have proper defaults
      const settingsWithDefaults = {
        ...settingsToSave,
        // Ensure syncInterval is a number
        syncInterval: settingsToSave.syncInterval || 60,
        // Ensure connectionTimeout is a number
        connectionTimeout: settingsToSave.connectionTimeout || 30000,
        // Default verifySSL to true if undefined
        verifySSL: settingsToSave.verifySSL !== false,
        // Ensure defaultLedgers is always an array
        defaultLedgers: settingsToSave.defaultLedgers || []
      };

      await saveSettings({
        ...settings,
        erpnext: settingsWithDefaults
      });
      
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to save settings',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, saveSettings]);

  // Test connection
  const testConnection = async () => {
    try {
      setIsTesting(true);
      // TODO: Implement actual connection test
      // const result = await testErpNextConnection(formData);
      // setTestResult(result);
      
      // Mock response for now
      setTimeout(() => {
        setTestResult({
          success: true,
          message: 'Connection successful',
          version: 'v15.0.0',
          serverInfo: {
            name: 'ERPNext',
            version: '15.0.0',
            setup_complete: true
          }
        });
        setSnackbar({
          open: true,
          message: 'Connection test successful',
          severity: 'success'
        });
        setIsTesting(false);
      }, 1500);
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult({
        success: false,
        message: 'Connection failed: ' + (error as Error).message
      });
      setSnackbar({
        open: true,
        message: 'Connection test failed',
        severity: 'error'
      });
      setIsTesting(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardHeader 
          title="ERPNext Integration Settings" 
          subheader="Configure your ERPNext connection and synchronization settings"
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <BusinessIcon />
            </Avatar>
          }
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<SyncIcon />}
              onClick={testConnection}
              disabled={isTesting}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          }
        />
        
        <CardContent>
          {testResult && (
            <Alert 
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mb: 3 }}
            >
              <AlertTitle>
                {testResult.success ? 'Connection Successful' : 'Connection Failed'}
              </AlertTitle>
              {testResult.message}
              {testResult.version && (
                <Box component="div" sx={{ mt: 1 }}>
                  <strong>Version:</strong> {testResult.version}
                </Box>
              )}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Connection Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Connection Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ERPNext URL"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://erpnext.example.com"
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API Key"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API Secret"
                name="apiSecret"
                type={showApiSecret ? 'text' : 'password'}
                value={formData.apiSecret}
                onChange={handleChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SecurityIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowApiSecret(!showApiSecret)}
                        edge="end"
                      >
                        {showApiSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                margin="normal"
                helperText="Default company in ERPNext"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="auth-method-label">Authentication Method</InputLabel>
                <Select
                  labelId="auth-method-label"
                  id="authMethod"
                  name="authMethod"
                  value={formData.authMethod}
                  onChange={(e: SelectChangeEvent) => 
                    handleChange(e as React.ChangeEvent<HTMLInputElement>)
                  }
                  label="Authentication Method"
                >
                  <MenuItem value="api_key">API Key</MenuItem>
                  <MenuItem value="oauth2">OAuth 2.0</MenuItem>
                  <MenuItem value="jwt">JWT</MenuItem>
                  <MenuItem value="session">Session</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* OAuth Configuration (conditionally shown) */}
            {formData.authMethod === 'oauth2' && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    OAuth 2.0 Configuration
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Client ID"
                        name="oauthClientId"
                        value={formData.oauthConfig?.clientId || ''}
                        onChange={(e) => 
                          handleNestedChange('oauthConfig', 'clientId', e.target.value)
                        }
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Client Secret"
                        name="oauthClientSecret"
                        type={showApiSecret ? 'text' : 'password'}
                        value={formData.oauthConfig?.clientSecret || ''}
                        onChange={(e) => 
                          handleNestedChange('oauthConfig', 'clientSecret', e.target.value)
                        }
                        margin="normal"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowApiSecret(!showApiSecret)}
                                edge="end"
                              >
                                {showApiSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Authorization URL"
                        name="oauthAuthUrl"
                        value={formData.oauthConfig?.authUrl || ''}
                        onChange={(e) => 
                          handleNestedChange('oauthConfig', 'authUrl', e.target.value)
                        }
                        margin="normal"
                        placeholder="https://erpnext.example.com/api/method/frappe.integrations.oauth2.authorize"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Token URL"
                        name="oauthTokenUrl"
                        value={formData.oauthConfig?.tokenUrl || ''}
                        onChange={(e) => 
                          handleNestedChange('oauthConfig', 'tokenUrl', e.target.value)
                        }
                        margin="normal"
                        placeholder="https://erpnext.example.com/api/method/frappe.integrations.oauth2.get_token"
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            )}
            
            {/* Advanced Settings Toggle */}
            <Grid item xs={12}>
              <Button
                startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowAdvanced(!showAdvanced)}
                color="primary"
              >
                {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
              </Button>
            </Grid>
            
            {/* Advanced Settings */}
            <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Advanced Settings
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.security.verifySSL}
                            onChange={(e) => 
                              handleNestedChange('security', 'verifySSL', e.target.checked)
                            }
                            name="verifySSL"
                            color="primary"
                          />
                        }
                        label="Verify SSL Certificate"
                        sx={{ mt: 1 }}
                      />
                      <FormHelperText>
                        Verify SSL certificates when making API requests
                      </FormHelperText>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.apiConfig.compression}
                            onChange={(e) => 
                              handleNestedChange('apiConfig', 'compression', e.target.checked)
                            }
                            name="apiCompression"
                            color="primary"
                          />
                        }
                        label="Enable Compression"
                        sx={{ mt: 1 }}
                      />
                      <FormHelperText>
                        Enable GZIP compression for API responses
                      </FormHelperText>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.advanced.enableDebugMode}
                            onChange={(e) => 
                              handleNestedChange('advanced', 'enableDebugMode', e.target.checked)
                            }
                            name="enableDebugMode"
                            color="primary"
                          />
                        }
                        label="Enable Debug Mode"
                        sx={{ mt: 1 }}
                      />
                      <FormHelperText>
                        Enable detailed debug logging (may affect performance)
                      </FormHelperText>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Collapse>
            
            {/* Action Buttons */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setFormData(DEFAULT_FORM_VALUES)}
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ErpNextSettings;
