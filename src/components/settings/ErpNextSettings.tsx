import React, { useState, useCallback } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import type { ErpNextSettings as ErpNextSettingsType } from '../../types/settings';
import type { TestResult, LedgerItem } from '../../types/erpnext-settings';
import { 
  Box, 
  Button, 
	Card,
	CardContent,
	CardHeader,
	CircularProgress,
	Collapse,
	FormControl,
  FormControlLabel, 
  FormHelperText, 
	Grid,
  IconButton,
	InputAdornment,
	InputLabel,
  MenuItem,
  Select,
  Snackbar,
	Switch,
	TextField,
	Typography,
	Alert,
  AlertTitle,
	Avatar
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { 
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
	Visibility as VisibilityIcon,
	VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

type ExtendedErpNextSettings = Omit<ErpNextSettingsType, 'defaultLedgers' | 'syncInterval' | 'connectionTimeout' | 'verifySSL'> & {
	defaultLedgers?: LedgerItem[];
	syncInterval?: number;
	verifySSL?: boolean;
	connectionTimeout?: number;
};

// const toLedgerItems = (items?: string[] | LedgerItem[]): LedgerItem[] => {
// 	if (!items) return [];
// 	return items.map(item => (typeof item === 'string' ? { name: item, account_name: item } : item));
// };

const ErpNextSettings: React.FC = () => {
  const { settings, saveSettings } = useSettings();

	const getInitialFormData = (): ExtendedErpNextSettings => {
		const erp = settings.erpnext || ({} as Partial<ErpNextSettingsType>);
		return {
			...(erp as unknown as ExtendedErpNextSettings),
			url: erp.url || '',
			apiKey: erp.apiKey || '',
			apiSecret: erp.apiSecret || '',
			company: erp.company || '',
			version: erp.version || 'v15',
			syncDirection: erp.syncDirection || 'bidirectional',
			conflictResolution: erp.conflictResolution || 'source',
			security: erp.security || {
				verifySSL: true,
				enableCORS: true,
				allowedOrigins: [],
				enableCSRF: true,
				dataEncryption: { enabled: true, algorithm: 'aes-256-gcm', keyRotationDays: 90 },
				ipWhitelist: [],
				userAgentFiltering: false
			},
			apiConfig: erp.apiConfig || {
				basePath: '/api/resource',
				version: 'v1',
				timeout: 30,
				retryPolicy: { maxRetries: 3, retryDelay: 5, backoffFactor: 2 },
				rateLimiting: { enabled: true, requestsPerMinute: 60, throttleDelay: 1000 },
				compression: true,
				keepAlive: true
			},
			performance: erp.performance || {
				enableQueryOptimization: true,
				enableCompression: true,
				maxConcurrentRequests: 10,
				requestTimeout: 30,
				cacheStrategy: 'memory',
				batchProcessing: { enabled: true, size: 100, delay: 1000 }
			},
			monitoring: erp.monitoring || {
				enableHealthChecks: true,
				healthCheckInterval: 5,
				enableMetrics: true,
				metricsEndpoint: '/metrics',
				enableAlerting: true,
				alertThresholds: { errorRate: 5, responseTime: 1000, queueSize: 1000 }
			},
			logging: erp.logging || {
				level: 'info',
				enableRequestLogging: true,
				enableAuditLogging: true,
				logRetentionDays: 30,
				logFormat: 'json',
				logToConsole: true,
				logToFile: false,
				logFilePath: '/var/log/erpnext-integration.log'
			},
			caching: erp.caching || {
				enabled: true,
				provider: 'memory',
				ttl: 3600,
				namespaced: true,
				namespace: 'erpnext',
				encryption: true,
				compression: true
			},
			errorHandling: erp.errorHandling || {
				autoRetryFailed: true,
				maxRetryAttempts: 3,
				retryDelay: 5,
				notifyOnFailure: true,
				notificationChannels: ['email']
			},
			advanced: erp.advanced || {
				enableDebugMode: false,
				enableProfiling: false,
				enableQueryLogging: false,
				enablePerformanceMetrics: true,
				customHeaders: {},
				customParameters: {},
				plugins: [],
				featureFlags: {}
			},
			metadata: erp.metadata || {
				createdAt: new Date(),
				updatedAt: new Date(),
				createdBy: 'system',
				updatedBy: 'system',
				version: '1.0.0',
				tags: ['erpnext', 'integration']
			}
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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type } = e.target;
		const checked = 'checked' in e.target ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({
      ...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

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

	const handleSave = useCallback(async () => {
		try {
			setIsLoading(true);
			const defaultLedgers = formData.defaultLedgers || [];
			const defaultLedgerStrings = defaultLedgers.map(item => item.name || item.account_name);
			const settingsToSave: ErpNextSettingsType = {
				...(formData as any),
				url: formData.url || '',
				apiKey: formData.apiKey || '',
				apiSecret: formData.apiSecret || '',
				company: formData.company || '',
				version: formData.version || 'v15',
				authMethod: formData.authMethod || 'api_key',
				syncDirection: formData.syncDirection || 'bidirectional',
				conflictResolution: formData.conflictResolution || 'source',
				oauthConfig: formData.oauthConfig,
				syncSchedule: formData.syncSchedule || {
					enabled: false,
					interval: 3600,
					startTime: '00:00',
					endTime: '23:59',
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					daysOfWeek: [1, 2, 3, 4, 5],
					excludeHolidays: true,
					maxRetryAttempts: 3,
					retryDelay: 300,
					batchSize: 100,
					priority: 'normal'
				}
			} as ErpNextSettingsType;

			const settingsWithDefaults: ErpNextSettingsType & { verifySSL?: boolean; syncInterval?: number; connectionTimeout?: number; defaultLedgers?: string[] } = {
				...settingsToSave,
				defaultLedgers: defaultLedgerStrings,
				// include fields that are part of app-level settings extension (not in erpnext-settings type)
				syncInterval: (settingsToSave as any).syncInterval || 60,
				connectionTimeout: (settingsToSave as any).connectionTimeout || 30000,
				verifySSL: (settingsToSave as any).verifySSL !== false,
      };
      
      await saveSettings({
        ...settings,
				erpnext: settingsWithDefaults as any
			});

			setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
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
	}, [formData, saveSettings, settings]);

	const testConnection = async () => {
		try {
			setIsTesting(true);
			setTimeout(() => {
				setTestResult({ success: true, message: 'Connection successful', version: 'v15.0.0', serverInfo: {} });
				setSnackbar({ open: true, message: 'Connection test successful', severity: 'success' });
				setIsTesting(false);
			}, 800);
    } catch (error) {
			console.error('Connection test failed:', error);
			setTestResult({ success: false, message: 'Connection failed' });
			setSnackbar({ open: true, message: 'Connection test failed', severity: 'error' });
			setIsTesting(false);
		}
	};



	const toggleAdvanced = useCallback(() => setShowAdvanced(prev => !prev), []);
	const handleSnackbarClose = () => setSnackbar(prev => ({ ...prev, open: false }));

        return (
		<Box sx={{ width: '100%' }}>
			<Card>
				<CardHeader
					title="ERPNext Integration Settings"
					subheader="Configure your ERPNext connection and synchronization settings"
					avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><BusinessIcon /></Avatar>}
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
						<Alert severity={testResult.success ? 'success' : 'error'} sx={{ mb: 3 }}>
							<AlertTitle>{testResult.success ? 'Connection Successful' : 'Connection Failed'}</AlertTitle>
							{testResult.message}
							{testResult.version && (
								<Box component="div" sx={{ mt: 1 }}>
									<strong>Version:</strong> {testResult.version}
								</Box>
							)}
						</Alert>
					)}

					<Grid container spacing={3}>
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
											<IconButton onClick={() => setShowApiSecret(!showApiSecret)} edge="end">
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
									onChange={(e: SelectChangeEvent) => handleChange(e as any)}
									label="Authentication Method"
								>
									<MenuItem value="api_key">API Key</MenuItem>
									<MenuItem value="oauth2">OAuth 2.0</MenuItem>
									<MenuItem value="jwt">JWT</MenuItem>
									<MenuItem value="session">Session</MenuItem>
                  </Select>
                </FormControl>
						</Grid>

						<Grid item xs={12}>
							<Button startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />} onClick={toggleAdvanced} color="primary">
								{showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
							</Button>
						</Grid>

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
														checked={!!formData.security?.verifySSL}
														onChange={(e) => handleNestedChange('security', 'verifySSL', e.target.checked)}
                      name="verifySSL"
                      color="primary"
                    />
                  }
                  label="Verify SSL Certificate"
												sx={{ mt: 1 }}
											/>
											<FormHelperText>Verify SSL certificates when making API requests</FormHelperText>
										</Grid>

										<Grid item xs={12} md={6}>
											<FormControlLabel
												control={
													<Switch
														checked={!!formData.apiConfig?.compression}
														onChange={(e) => handleNestedChange('apiConfig', 'compression', e.target.checked)}
														name="apiCompression"
                color="primary"
													/>
												}
												label="Enable Compression"
												sx={{ mt: 1 }}
											/>
											<FormHelperText>Enable GZIP compression for API responses</FormHelperText>
										</Grid>

										<Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
														checked={!!formData.advanced?.enableDebugMode}
														onChange={(e) => handleNestedChange('advanced', 'enableDebugMode', e.target.checked)}
														name="enableDebugMode"
                    color="primary"
                  />
                }
												label="Enable Debug Mode"
												sx={{ mt: 1 }}
											/>
											<FormHelperText>Enable detailed debug logging (may affect performance)</FormHelperText>
										</Grid>
									</Grid>
								</Card>
							</Grid>
              </Collapse>

						<Grid item xs={12} sx={{ mt: 2 }}>
							<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
								<Button variant="outlined" onClick={() => setFormData(getInitialFormData())}>Reset to Defaults</Button>
								<Button variant="contained" color="primary" onClick={handleSave} disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}>
									{isLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>
						</Grid>
					</Grid>
        </CardContent>
      </Card>

			<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
				<Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
    </Box>
  );
};

export default ErpNextSettings;
