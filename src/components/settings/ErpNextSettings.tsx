import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { 
  ErpNextSettings as ErpNextSettingsType,
  FieldMapping,
  FieldValidation,
  FieldOption,
  TestResult,
  LedgerItem,
  SyncSchedule,
  WebhookConfig,
  PerformanceSettings,
  MonitoringSettings,
  ApiRateLimit as ApiRateLimitType,
  DataEncryption as DataEncryptionType,
  ErpNextSettings
} from '../../types/erpnext-settings';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel, 
  FormHelperText, 
  InputAdornment,
  IconButton,
  Collapse,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormGroup,
  Grid as MuiGrid,
  type SxProps,
  type Theme,
  type GridSize,
  Tabs,
  Tab,
  Badge,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Autocomplete,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  AlertTitle,
  Skeleton,
  useMediaQuery,
  useTheme,
  Zoom,
  Fade,
  Grow,
  Slide,
  useScrollTrigger,
  AppBar,
  Toolbar,
  Drawer,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Breadcrumbs
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { 
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  CloudSync as CloudSyncIcon,
  Api as ApiIcon,
  Webhook as WebhookIcon,
  DataUsage as DataUsageIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Autorenew as AutorenewIcon,
  Cached as CachedIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Dns as DnsIcon,
  Speed as SpeedIcon,
  Tune as TuneIcon,
  Code as CodeIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  VerifiedUser as VerifiedUserIcon,
  SecurityUpdateGood as SecurityUpdateGoodIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  ShowChart as ShowChartIcon,
  Timeline as TimelineIcon2,
  TableChart as TableChartIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListViewIcon,
  GridView as GridViewIcon,
  Apps as AppsIcon,
  ViewWeek as ViewWeekIcon,
  ViewDay as ViewDayIcon,
  ViewAgenda as ViewAgendaIcon,
  ViewCarousel as ViewCarouselIcon,
  ViewComfy as ViewComfyIcon,
  ViewCompact as ViewCompactIcon,
  ViewHeadline as ViewHeadlineIcon,
  ViewInAr as ViewInArIcon,
  ViewQuilt as ViewQuiltIcon,
  ViewSidebar as ViewSidebarIcon,
  ViewStream as ViewStreamIcon,
  WebAsset as WebAssetIcon,
  Widgets as WidgetsIcon,
  Work as WorkIcon,
  WorkOff as WorkOffIcon,
  WorkOutline as WorkOutlineIcon,
  Wysiwyg as WysiwygIcon,
  YoutubeSearchedFor as YoutubeSearchedForIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as ZoomOutMapIcon,
  Link as LinkIcon,
  AccessTime as AccessTimeIcon,
  ColorLens as ColorLensIcon,
  QrCode as BarcodeIcon,
  LocationOn as LocationOnIcon,
  Star as StarIcon,
  TextFields as TextFieldsIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Create as CreateIcon,
  Star as StarIcon2,
  Cloud as CloudIcon,
  CloudQueue as CloudQueueIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  CloudDownload as CloudDownloadIcon2,
  CloudUpload as CloudUploadIcon2,
  CloudCircle as CloudCircleIcon,
  CloudQueue as CloudQueueIcon2,
  CloudDone as CloudDoneIcon2,
  CloudOff as CloudOffIcon2,
  CloudDownload as CloudDownloadIcon3,
  CloudUpload as CloudUploadIcon3,
  CloudCircle as CloudCircleIcon2,
  CloudQueue as CloudQueueIcon3,
  CloudDone as CloudDoneIcon3,
  CloudOff as CloudOffIcon3,
  CloudDownload as CloudDownloadIcon4,
  CloudUpload as CloudUploadIcon4,
  CloudCircle as CloudCircleIcon3,
  CloudQueue as CloudQueueIcon4,
  CloudDone as CloudDoneIcon4,
  CloudOff as CloudOffIcon4,
  CloudDownload as CloudDownloadIcon5,
  CloudUpload as CloudUploadIcon5,
  CloudCircle as CloudCircleIcon4,
  CloudQueue as CloudQueueIcon5,
  CloudDone as CloudDoneIcon5,
  CloudOff as CloudOffIcon5,
  CloudDownload as CloudDownloadIcon6,
  CloudUpload as CloudUploadIcon6,
  CloudCircle as CloudCircleIcon5
} from '@mui/icons-material';
import GridContainer from '../common/GridContainer';
import GridItem from '../common/GridItem';

// Supported ERPNext versions with their API endpoints and features
const ERP_NEXT_VERSIONS = [
  { 
    version: 'v15', 
    name: 'Version 15 (Latest)', 
    apiPath: '/api/resource',
    features: [
      'Webhooks V2',
      'Improved API Performance',
      'Enhanced Security',
      'Real-time Updates'
    ]
  },
  { 
    version: 'v14', 
    name: 'Version 14', 
    apiPath: '/api/resource',
    features: [
      'Standard API',
      'Basic Webhooks',
      'Stable Release'
    ]
  },
  { 
    version: 'v13', 
    name: 'Version 13', 
    apiPath: '/api/resource',
    features: [
      'Legacy Support',
      'Basic API'
    ]
  },
  { 
    version: 'custom', 
    name: 'Custom', 
    apiPath: '',
    features: [
      'Custom Configuration',
      'Manual Setup'
    ]
  },
];

// Default field mappings with enhanced metadata
const DEFAULT_FIELD_MAPPINGS: FieldMapping[] = [
  { 
    localField: 'name', 
    erpnextField: 'name', 
    dataType: 'text', 
    required: true,
    description: 'Unique identifier for the document',
    validation: {
      minLength: 1,
      maxLength: 140,
      pattern: '^[a-zA-Z0-9-_]+$',
      errorMessage: 'Only alphanumeric, hyphen and underscore are allowed'
    }
  },
  { 
    localField: 'customer', 
    erpnextField: 'customer', 
    dataType: 'text', 
    required: true,
    description: 'Customer name or ID',
    validation: {
      minLength: 3,
      maxLength: 140
    }
  },
  { 
    localField: 'total', 
    erpnextField: 'grand_total', 
    dataType: 'number', 
    required: true,
    description: 'Total amount including taxes',
    validation: {
      min: 0,
      precision: 2,
      errorMessage: 'Must be a positive number with up to 2 decimal places'
    }
  },
  { 
    localField: 'date', 
    erpnextField: 'posting_date', 
    dataType: 'date', 
    required: true,
    description: 'Date of the transaction',
    validation: {
      minDate: '2000-01-01',
      maxDate: '2100-12-31',
      errorMessage: 'Date must be between 2000-01-01 and 2100-12-31'
    }
  },
  { 
    localField: 'status', 
    erpnextField: 'status', 
    dataType: 'select', 
    required: true, 
    defaultValue: 'Draft',
    description: 'Current status of the document',
    options: [
      { value: 'Draft', label: 'Draft' },
      { value: 'Submitted', label: 'Submitted' },
      { value: 'Cancelled', label: 'Cancelled' },
      { value: 'Paid', label: 'Paid' },
      { value: 'Return', label: 'Return' },
      { value: 'Credit Note Issued', label: 'Credit Note Issued' },
      { value: 'Unpaid', label: 'Unpaid' },
      { value: 'Overdue', label: 'Overdue' },
      { value: 'Unreconciled', label: 'Unreconciled' },
      { value: 'Partly Paid', label: 'Partly Paid' },
      { value: 'Internal Transfer', label: 'Internal Transfer' },
      { value: 'Ordered', label: 'Ordered' },
      { value: 'Consolidated', label: 'Consolidated' },
      { value: 'Queued', label: 'Queued' },
      { value: 'Processing', label: 'Processing' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Failed', label: 'Failed' },
      { value: 'Not Applicable', label: 'Not Applicable' }
    ],
    validation: {
      allowedValues: ['Draft', 'Submitted', 'Cancelled', 'Paid'],
      errorMessage: 'Invalid status value'
    }
  },
];

// Sync direction options with icons and descriptions
const SYNC_DIRECTIONS = [
  { 
    value: 'erpnext_to_app', 
    label: 'ERPNext to App',
    icon: <CloudDownloadIcon />,
    description: 'One-way sync from ERPNext to this application',
    helpText: 'Use this for read-only access to ERPNext data',
    recommendedFor: ['Reporting', 'Analytics', 'Dashboards']
  },
  { 
    value: 'app_to_erpnext', 
    label: 'App to ERPNext',
    icon: <CloudUploadIcon />,
    description: 'One-way sync from this application to ERPNext',
    helpText: 'Use this when this app is the source of truth',
    recommendedFor: ['Data Entry', 'Mobile Data Collection']
  },
  { 
    value: 'bidirectional', 
    label: 'Bidirectional',
    icon: <SyncIcon />,
    description: 'Two-way sync between ERPNext and this application',
    helpText: 'Use this when both systems need to stay in sync',
    recommendedFor: ['Order Management', 'Inventory', 'CRM'],
    warning: 'Requires conflict resolution strategy'
  },
];

// Sync frequency options in minutes
const SYNC_FREQUENCIES = [
  { value: 1, label: '1 minute', description: 'Real-time sync (every minute)' },
  { value: 5, label: '5 minutes', description: 'Near real-time sync' },
  { value: 15, label: '15 minutes', description: 'Frequent updates' },
  { value: 30, label: '30 minutes', description: 'Regular updates' },
  { value: 60, label: '1 hour', description: 'Hourly updates' },
  { value: 240, label: '4 hours', description: 'Periodic updates' },
  { value: 720, label: '12 hours', description: 'Twice daily' },
  { value: 1440, label: '24 hours', description: 'Daily updates' },
  { value: 10080, label: '1 week', description: 'Weekly updates' },
  { value: 0, label: 'Manual', description: 'Sync only when triggered manually' },
];

// Webhook event types
const WEBHOOK_EVENTS = [
  { 
    value: 'invoice_created', 
    label: 'Invoice Created',
    description: 'Triggered when a new invoice is created',
    default: true
  },
  { 
    value: 'invoice_updated', 
    label: 'Invoice Updated',
    description: 'Triggered when an existing invoice is updated',
    default: true
  },
  { 
    value: 'invoice_deleted', 
    label: 'Invoice Deleted',
    description: 'Triggered when an invoice is deleted',
    default: false
  },
  { 
    value: 'payment_received', 
    label: 'Payment Received',
    description: 'Triggered when a payment is received against an invoice',
    default: true
  },
  { 
    value: 'sync_started', 
    label: 'Sync Started',
    description: 'Triggered when a sync operation starts',
    default: false
  },
  { 
    value: 'sync_completed', 
    label: 'Sync Completed',
    description: 'Triggered when a sync operation completes successfully',
    default: true
  },
  { 
    value: 'sync_failed', 
    label: 'Sync Failed',
    description: 'Triggered when a sync operation fails',
    default: true
  },
  { 
    value: 'error_occurred', 
    label: 'Error Occurred',
    description: 'Triggered when an error occurs in the integration',
    default: true
  },
];

// Data types for field mappings
const FIELD_DATA_TYPES = [
  { 
    value: 'text', 
    label: 'Text',
    icon: <Typography>Abc</Typography>,
    description: 'Plain text or string values'
  },
  { 
    value: 'number', 
    label: 'Number',
    icon: <Typography>123</Typography>,
    description: 'Numeric values (integers or decimals)'
  },
  { 
    value: 'date', 
    label: 'Date',
    icon: <Typography>31/12</Typography>,
    description: 'Date values (with optional time)'
  },
  { 
    value: 'boolean', 
    label: 'Yes/No',
    icon: <CheckIcon />,
    description: 'True/False or Yes/No values'
  },
  { 
    value: 'select', 
    label: 'Dropdown',
    icon: <ExpandMoreIcon />,
    description: 'Predefined list of options'
  },
  { 
    value: 'link', 
    label: 'Link',
    icon: <LinkIcon />,
    description: 'Reference to another document'
  },
  { 
    value: 'table', 
    label: 'Table',
    icon: <TableChartIcon />,
    description: 'Child table with multiple rows'
  },
  { 
    value: 'currency', 
    label: 'Currency',
    icon: <Typography>₹$€</Typography>,
    description: 'Monetary values with currency'
  },
  { 
    value: 'percent', 
    label: 'Percentage',
    icon: <Typography>%</Typography>,
    description: 'Percentage values (0-100)'
  },
  { 
    value: 'duration', 
    label: 'Duration',
    icon: <AccessTimeIcon />,
    description: 'Time duration in hours and minutes'
  },
  { 
    value: 'color', 
    label: 'Color',
    icon: <ColorLensIcon />,
    description: 'Color picker with hex/rgb values'
  },
  { 
    value: 'barcode', 
    label: 'Barcode',
    icon: <BarcodeIcon />,
    description: 'Barcode or QR code data'
  },
  { 
    value: 'geolocation', 
    label: 'Location',
    icon: <LocationOnIcon />,
    description: 'Geographical coordinates (latitude/longitude)'
  },
  { 
    value: 'rating', 
    label: 'Rating',
    icon: <StarIcon />,
    description: 'Star rating (1-5)'
  },
  { 
    value: 'markdown', 
    label: 'Rich Text',
    icon: <TextFieldsIcon />,
    description: 'Formatted text with markdown support'
  },
  { 
    value: 'file', 
    label: 'File',
    icon: <AttachFileIcon />,
    description: 'File attachments'
  },
  { 
    value: 'image', 
    label: 'Image',
    icon: <ImageIcon />,
    description: 'Image files with preview'
  },
  { 
    value: 'signature', 
    label: 'Signature',
    icon: <CreateIcon />,
    description: 'Digital signature capture'
  },
  { 
    value: 'password', 
    label: 'Password',
    icon: <LockIcon />,
    description: 'Encrypted password field'
  },
  { 
    value: 'code', 
    label: 'Code',
    icon: <CodeIcon />,
    description: 'Syntax highlighted code editor'
  },
];

// Using imported FieldValidation interface from erpnext-settings.ts
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  errorMessage?: string;
  allowedValues?: string[];
  minDate?: string;
  maxDate?: string;
  precision?: number;
}

// Using imported FieldOption interface from erpnext-settings.ts
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

// Using imported FieldMapping interface from erpnext-settings.ts
  // Core fields
  localField: string;
  erpnextField: string;
  dataType: string;
  required: boolean;
  
  // Display
  label?: string;
  description?: string;
  placeholder?: string;
  group?: string;
  
  // Data handling
  defaultValue?: any;
  isReadOnly?: boolean;
  isHidden?: boolean;
  isComputed?: boolean;
  computeExpression?: string;
  
  // Validation
  validation?: FieldValidation;
  
  // UI Controls
  controlType?: 'input' | 'select' | 'checkbox' | 'date' | 'datetime' | 'time' | 'textarea' | 'autocomplete';
  options?: FieldOption[];
  
  // Advanced
  dependsOn?: string[];
  showIf?: Record<string, any>;
  transformIn?: (value: any) => any;
  transformOut?: (value: any) => any;
  
  // Metadata
  meta?: Record<string, any>;
}

// Using imported SyncSchedule interface from erpnext-settings.ts
  enabled: boolean;
  interval: number; // minutes
  lastSync?: Date;
  nextSync?: Date;
  lastStatus?: 'success' | 'failed' | 'in-progress';
  lastErrorMessage?: string;
  syncWindow?: {
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    timezone: string;  // IANA timezone
  };
  daysOfWeek?: number[]; // 0-6 (Sun-Sat)
  excludeHolidays?: boolean;
  maxRetryAttempts?: number;
  retryDelay?: number; // minutes
  batchSize?: number;
  priority?: 'low' | 'normal' | 'high';
}

// Using imported WebhookConfig interface from erpnext-settings.ts
  enabled: boolean;
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  timeout?: number; // seconds
  retryPolicy?: {
    enabled: boolean;
    maxRetries: number;
    retryInterval: number; // seconds
    backoffMultiplier: number;
  };
  payloadTemplate?: string;
  active?: boolean;
  lastDelivery?: {
    timestamp: Date;
    status: 'success' | 'failed';
    statusCode?: number;
    response?: string;
    error?: string;
  };
  stats?: {
    total: number;
    success: number;
    failed: number;
    lastUpdated: Date;
  };
}

interface ApiRateLimit {
  enabled: boolean;
  requestsPerMinute: number;
  throttleDelay: number; // ms
}

interface DataEncryption {
  enabled: boolean;
  algorithm: 'aes-256-gcm' | 'aes-128-gcm';
  keyRotationDays: number;
}

// Using imported PerformanceSettings interface from erpnext-settings.ts
  enableQueryOptimization: boolean;
  enableCompression: boolean;
  maxConcurrentRequests: number;
  requestTimeout: number; // seconds
  cacheStrategy: 'memory' | 'redis' | 'custom';
  batchProcessing: {
    enabled: boolean;
    size: number;
    delay: number; // ms
  };
}

// Using imported MonitoringSettings interface from erpnext-settings.ts
  enableHealthChecks: boolean;
  healthCheckInterval: number; // minutes
  enableMetrics: boolean;
  metricsEndpoint: string;
  enableAlerting: boolean;
  alertThresholds: {
    errorRate: number; // percentage
    responseTime: number; // ms
    queueSize: number;
  };
}

// Main settings interface
export // Using imported ErpNextSettings interface from erpnext-settings.ts
  // Connection
  url: string;
  apiKey: string;
  apiSecret: string;
  company: string;
  version: string;
  
  // Authentication
  authMethod: 'api_key' | 'oauth2' | 'jwt' | 'session';
  oauthConfig?: {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
  };
  
  // Sync Configuration
  syncDirection: 'erpnext_to_app' | 'app_to_erpnext' | 'bidirectional';
  syncSchedule: SyncSchedule;
  conflictResolution: 'source' | 'target' | 'manual' | 'custom';
  fieldMappings: FieldMapping[];
  fieldGroups: Array<{ id: string; name: string; description?: string; icon?: string; fields: string[] }>;
  
  // Webhook Configuration
  webhook: WebhookConfig;
  
  // API Configuration
  apiConfig: {
    timeout: number;
    maxRetries: number;
    rateLimit: number;
    batchSize: number;
    concurrency: number;
    useBulkApi: boolean;
    retryOnFailure: boolean;
    retryDelay: number;
  };
  
  // Security Settings
  security: {
    enableEncryption: boolean;
    encryptionKey?: string;
    enableAuditLog: boolean;
    ipWhitelist: string[];
    userPermissions: {
      read: string[];
      write: string[];
      admin: string[];
    };
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumber: boolean;
      requireSpecialChar: boolean;
    };
  };
  
  // Performance Settings
  performance: PerformanceSettings;
  
  // Monitoring Settings
  monitoring: MonitoringSettings;
  
  // Logging Settings
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    maxSize: number;
    maxFiles: number;
    enableConsole: boolean;
    enableFile: boolean;
    logFilePath: string;
  };
  
  // Caching Settings
  caching: {
    enabled: boolean;
    ttl: number;
    provider: 'memory' | 'redis' | 'memcached';
    cacheKeyPrefix: string;
    excludedEndpoints: string[];
  };
  
  // Error Handling
  errorHandling: {
    autoRetryFailed: boolean;
    maxRetryAttempts: number;
    retryDelay: number;
    notifyOnFailure: boolean;
    notificationEmail?: string;
    logErrors: boolean;
    ignoreErrors: string[];
  };
  
  // Advanced Settings
  advanced: {
    debugMode: boolean;
    enableExperimental: boolean;
    customScripts: string[];
    customCSS?: string;
    featureFlags: Record<string, boolean>;

const ErpNextSettings: React.FC = () => {
  const { settings, saveSettings } = useSettings();
  
  // Form state with default values
  const { control, handleSubmit, formState: { errors }, reset } = useForm<ErpNextSettingsType>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      // Connection
      url: settings.erpnext?.url || '',
      apiKey: settings.erpnext?.apiKey || '',
      apiSecret: settings.erpnext?.apiSecret || '',
      company: settings.erpnext?.company || '',
      version: settings.erpnext?.version || 'v15',
      
      // Authentication
      authMethod: settings.erpnext?.authMethod || 'api_key',
      oauthConfig: settings.erpnext?.oauthConfig || {
        clientId: '',
        clientSecret: '',
        authUrl: '',
        tokenUrl: '',
        scopes: ['all']
    version: settings.erpnext?.version || 'v15',
    
    // Authentication
    authMethod: settings.erpnext?.authMethod || 'api_key',
    oauthConfig: settings.erpnext?.oauthConfig || {
      clientId: '',
      clientSecret: '',
      authUrl: '',
      tokenUrl: '',
      scopes: ['all']
    },
    
    // Sync Configuration
    syncDirection: settings.erpnext?.syncDirection || 'bidirectional',
    syncSchedule: {
      enabled: settings.erpnext?.syncSchedule?.enabled ?? true,
      interval: settings.erpnext?.syncSchedule?.interval || 60,
      lastSync: settings.erpnext?.syncSchedule?.lastSync,
      nextSync: settings.erpnext?.syncSchedule?.nextSync,
      lastStatus: settings.erpnext?.syncSchedule?.lastStatus,
      lastErrorMessage: settings.erpnext?.syncSchedule?.lastErrorMessage,
      startTime: '00:00',
      endTime: '23:59',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      daysOfWeek: settings.erpnext?.syncSchedule?.daysOfWeek || [1, 2, 3, 4, 5],
      excludeHolidays: settings.erpnext?.syncSchedule?.excludeHolidays ?? true,
      maxRetryAttempts: settings.erpnext?.syncSchedule?.maxRetryAttempts || 3,
      retryDelay: settings.erpnext?.syncSchedule?.retryDelay || 5,
      batchSize: settings.erpnext?.syncSchedule?.batchSize || 100,
      priority: settings.erpnext?.syncSchedule?.priority || 'normal'
    },
    conflictResolution: settings.erpnext?.conflictResolution || 'source',
    
    // Data Mapping
    fieldMappings: settings.erpnext?.fieldMappings || DEFAULT_FIELD_MAPPINGS,
    fieldGroups: settings.erpnext?.fieldGroups || [
      {
        id: 'basic',
        name: 'Basic Information',
        description: 'Core fields for the document',
        icon: 'info',
        fields: ['name', 'customer', 'date', 'status']
      },
      {
        id: 'financial',
        name: 'Financial Details',
        description: 'Financial fields',
        icon: 'attach_money',
        fields: ['total', 'tax', 'discount']
      }
    ],
    
    // Webhooks
    webhook: {
      enabled: settings.erpnext?.webhook?.enabled ?? false,
      url: settings.erpnext?.webhook?.url || '',
      events: settings.erpnext?.webhook?.events || ['invoice_created', 'invoice_updated', 'sync_completed'],
      secret: settings.erpnext?.webhook?.secret || '',
      headers: settings.erpnext?.webhook?.headers || {},
      timeout: settings.erpnext?.webhook?.timeout || 30,
      retryPolicy: {
        enabled: settings.erpnext?.webhook?.retryPolicy?.enabled ?? true,
        maxRetries: settings.erpnext?.webhook?.retryPolicy?.maxRetries || 3,
        retryInterval: settings.erpnext?.webhook?.retryPolicy?.retryInterval || 5,
        backoffMultiplier: settings.erpnext?.webhook?.retryPolicy?.backoffMultiplier || 2
      },
      payloadTemplate: settings.erpnext?.webhook?.payloadTemplate || '',
      active: settings.erpnext?.webhook?.active ?? false,
      lastDelivery: settings.erpnext?.webhook?.lastDelivery,
      stats: {
        total: settings.erpnext?.webhook?.stats?.total || 0,
        success: settings.erpnext?.webhook?.stats?.success || 0,
        failed: settings.erpnext?.webhook?.stats?.failed || 0,
        lastUpdated: settings.erpnext?.webhook?.stats?.lastUpdated || new Date()
      }
    },
    
    // API Configuration
    apiConfig: {
      basePath: settings.erpnext?.apiConfig?.basePath || '/api/resource',
      version: settings.erpnext?.apiConfig?.version || 'v1',
      timeout: settings.erpnext?.apiConfig?.timeout || 30000,
      retryPolicy: {
        maxRetries: settings.erpnext?.apiConfig?.retryPolicy?.maxRetries || 3,
        retryDelay: settings.erpnext?.apiConfig?.retryPolicy?.retryDelay || 1000,
        backoffFactor: settings.erpnext?.apiConfig?.retryPolicy?.backoffFactor || 2
      },
      rateLimiting: {
        enabled: settings.erpnext?.apiConfig?.rateLimiting?.enabled ?? false,
        requestsPerMinute: settings.erpnext?.apiConfig?.rateLimiting?.requestsPerMinute || 60,
        throttleDelay: settings.erpnext?.apiConfig?.rateLimiting?.throttleDelay || 0
      },
      compression: settings.erpnext?.apiConfig?.compression ?? true,
      keepAlive: settings.erpnext?.apiConfig?.keepAlive ?? true
    },
    
    // Security
    security: {
      verifySSL: settings.erpnext?.security?.verifySSL ?? true,
      enableCORS: settings.erpnext?.security?.enableCORS ?? true,
      allowedOrigins: settings.erpnext?.security?.allowedOrigins || [],
      enableCSRF: settings.erpnext?.security?.enableCSRF ?? true,
      dataEncryption: {
        enabled: settings.erpnext?.security?.dataEncryption?.enabled ?? false,
        algorithm: settings.erpnext?.security?.dataEncryption?.algorithm || 'aes-256-gcm',
        keyRotationDays: settings.erpnext?.security?.dataEncryption?.keyRotationDays || 90
      },
      ipWhitelist: settings.erpnext?.security?.ipWhitelist || [],
      userAgentFiltering: settings.erpnext?.security?.userAgentFiltering ?? false
    },
    
    // Performance
    performance: {
      enableQueryOptimization: settings.erpnext?.performance?.enableQueryOptimization ?? true,
      enableCompression: settings.erpnext?.performance?.enableCompression ?? true,
      maxConcurrentRequests: settings.erpnext?.performance?.maxConcurrentRequests || 10,
      requestTimeout: settings.erpnext?.performance?.requestTimeout || 30000,
      cacheStrategy: settings.erpnext?.performance?.cacheStrategy || 'memory',
      batchProcessing: {
        enabled: settings.erpnext?.performance?.batchProcessing?.enabled ?? true,
        size: settings.erpnext?.performance?.batchProcessing?.size || 100,
        delay: settings.erpnext?.performance?.batchProcessing?.delay || 0
      }
    },
    
    // Monitoring
    monitoring: {
      enableHealthChecks: settings.erpnext?.monitoring?.enableHealthChecks ?? true,
      healthCheckInterval: settings.erpnext?.monitoring?.healthCheckInterval || 300,
      enableMetrics: settings.erpnext?.monitoring?.enableMetrics ?? true,
      metricsEndpoint: settings.erpnext?.monitoring?.metricsEndpoint || '/metrics',
      enableAlerting: settings.erpnext?.monitoring?.enableAlerting ?? true,
      alertThresholds: {
        errorRate: settings.erpnext?.monitoring?.alertThresholds?.errorRate || 5,
        responseTime: settings.erpnext?.monitoring?.alertThresholds?.responseTime || 1000,
        queueSize: settings.erpnext?.monitoring?.alertThresholds?.queueSize || 1000
      }
    },
    
    // Logging
    logging: {
      level: settings.erpnext?.logging?.level || 'info',
      enableRequestLogging: settings.erpnext?.logging?.enableRequestLogging ?? true,
      enableAuditLogging: settings.erpnext?.logging?.enableAuditLogging ?? true,
      logRetentionDays: settings.erpnext?.logging?.logRetentionDays || 30,
      logFormat: settings.erpnext?.logging?.logFormat || 'json',
      logToConsole: settings.erpnext?.logging?.logToConsole ?? true,
      logToFile: settings.erpnext?.logging?.logToFile ?? false,
      logFilePath: settings.erpnext?.logging?.logFilePath || './logs/erpnext.log'
    },
    
    // Caching
    caching: {
      enabled: settings.erpnext?.caching?.enabled ?? true,
      provider: settings.erpnext?.caching?.provider || 'memory',
      ttl: settings.erpnext?.caching?.ttl || 300,
      namespaced: settings.erpnext?.caching?.namespaced ?? true,
      namespace: settings.erpnext?.caching?.namespace || 'erpnext',
      encryption: settings.erpnext?.caching?.encryption ?? false,
      compression: settings.erpnext?.caching?.compression ?? true
    },
    
    // Error Handling
    errorHandling: {
      autoRetryFailed: settings.erpnext?.errorHandling?.autoRetryFailed ?? true,
      maxRetryAttempts: settings.erpnext?.errorHandling?.maxRetryAttempts || 3,
      retryDelay: settings.erpnext?.errorHandling?.retryDelay || 5,
      notifyOnFailure: settings.erpnext?.errorHandling?.notifyOnFailure ?? true,
      notificationChannels: settings.erpnext?.errorHandling?.notificationChannels || ['email'],
      notificationEmail: settings.erpnext?.errorHandling?.notificationEmail,
      slackWebhookUrl: settings.erpnext?.errorHandling?.slackWebhookUrl,
      customWebhookUrl: settings.erpnext?.errorHandling?.customWebhookUrl
    },
    
    // Advanced
    advanced: {
      enableDebugMode: settings.erpnext?.advanced?.enableDebugMode ?? false,
      enableProfiling: settings.erpnext?.advanced?.enableProfiling ?? false,
      enableQueryLogging: settings.erpnext?.advanced?.enableQueryLogging ?? false,
      enablePerformanceMetrics: settings.erpnext?.advanced?.enablePerformanceMetrics ?? true,
      customHeaders: settings.erpnext?.advanced?.customHeaders || {},
      customParameters: settings.erpnext?.advanced?.customParameters || {},
      plugins: settings.erpnext?.advanced?.plugins || [],
      featureFlags: settings.erpnext?.advanced?.featureFlags || {}
    },
    
    // Metadata
    metadata: {
      createdAt: settings.erpnext?.metadata?.createdAt || new Date(),
      updatedAt: settings.erpnext?.metadata?.updatedAt || new Date(),
      createdBy: settings.erpnext?.metadata?.createdBy || 'system',
      updatedBy: settings.erpnext?.metadata?.updatedBy || 'system',
      version: settings.erpnext?.metadata?.version || '1.0.0',
      tags: settings.erpnext?.metadata?.tags || []
    }
    apiConfig: {
      basePath: settings.erpnext?.apiConfig?.basePath || '/api/resource',
      version: settings.erpnext?.apiConfig?.version || '1.0',
      timeout: settings.erpnext?.apiConfig?.timeout || 30,
      retryPolicy: {
        maxRetries: settings.erpnext?.apiConfig?.retryPolicy?.maxRetries || 3,
        retryDelay: settings.erpnext?.apiConfig?.retryPolicy?.retryDelay || 1000,
        backoffFactor: settings.erpnext?.apiConfig?.retryPolicy?.backoffFactor || 2
      },
      rateLimiting: {
        enabled: settings.erpnext?.apiConfig?.rateLimiting?.enabled ?? true,
        requestsPerMinute: settings.erpnext?.apiConfig?.rateLimiting?.requestsPerMinute || 60,
        throttleDelay: settings.erpnext?.apiConfig?.rateLimiting?.throttleDelay || 1000
      },
      compression: settings.erpnext?.apiConfig?.compression ?? true,
      keepAlive: settings.erpnext?.apiConfig?.keepAlive ?? true
    },
    
    // Security
    security: {
      verifySSL: settings.erpnext?.security?.verifySSL ?? true,
      enableCORS: settings.erpnext?.security?.enableCORS ?? true,
      allowedOrigins: settings.erpnext?.security?.allowedOrigins || ['*'],
      enableCSRF: settings.erpnext?.security?.enableCSRF ?? true,
      dataEncryption: {
        enabled: settings.erpnext?.security?.dataEncryption?.enabled ?? true,
        algorithm: settings.erpnext?.security?.dataEncryption?.algorithm || 'aes-256-gcm',
        keyRotationDays: settings.erpnext?.security?.dataEncryption?.keyRotationDays || 90
      },
      ipWhitelist: settings.erpnext?.security?.ipWhitelist || [],
      userAgentFiltering: settings.erpnext?.security?.userAgentFiltering ?? false
    },
    
    // Performance
    performance: {
      enableQueryOptimization: settings.erpnext?.performance?.enableQueryOptimization ?? true,
      enableCompression: settings.erpnext?.performance?.enableCompression ?? true,
      maxConcurrentRequests: settings.erpnext?.performance?.maxConcurrentRequests || 10,
      requestTimeout: settings.erpnext?.performance?.requestTimeout || 30,
      cacheStrategy: settings.erpnext?.performance?.cacheStrategy || 'memory',
      batchProcessing: {
        enabled: settings.erpnext?.performance?.batchProcessing?.enabled ?? true,
        size: settings.erpnext?.performance?.batchProcessing?.size || 100,
        delay: settings.erpnext?.performance?.batchProcessing?.delay || 1000
      }
    },
    
    // Monitoring & Logging
    monitoring: {
      enableHealthChecks: settings.erpnext?.monitoring?.enableHealthChecks ?? true,
      healthCheckInterval: settings.erpnext?.monitoring?.healthCheckInterval || 5,
      enableMetrics: settings.erpnext?.monitoring?.enableMetrics ?? true,
      metricsEndpoint: settings.erpnext?.monitoring?.metricsEndpoint || '/metrics',
      enableAlerting: settings.erpnext?.monitoring?.enableAlerting ?? true,
      alertThresholds: {
        errorRate: settings.erpnext?.monitoring?.alertThresholds?.errorRate || 5,
        responseTime: settings.erpnext?.monitoring?.alertThresholds?.responseTime || 5000,
        queueSize: settings.erpnext?.monitoring?.alertThresholds?.queueSize || 1000
      }
    },
    
    logging: {
      level: settings.erpnext?.logging?.level || 'info',
      enableRequestLogging: settings.erpnext?.logging?.enableRequestLogging ?? true,
      enableAuditLogging: settings.erpnext?.logging?.enableAuditLogging ?? true,
      logRetentionDays: settings.erpnext?.logging?.logRetentionDays || 30,
      logFormat: settings.erpnext?.logging?.logFormat || 'json',
      logToConsole: settings.erpnext?.logging?.logToConsole ?? true,
      logToFile: settings.erpnext?.logging?.logToFile ?? false,
      logFilePath: settings.erpnext?.logging?.logFilePath || './logs/erpnext-integration.log'
    },
    
    // Caching
    caching: {
      enabled: settings.erpnext?.caching?.enabled ?? true,
      provider: settings.erpnext?.caching?.provider || 'memory',
      ttl: settings.erpnext?.caching?.ttl || 60,
      namespaced: settings.erpnext?.caching?.namespaced ?? true,
      namespace: settings.erpnext?.caching?.namespace || 'erpnext',
      encryption: settings.erpnext?.caching?.encryption ?? true,
      compression: settings.erpnext?.caching?.compression ?? true
    },
    
    // Error Handling
    errorHandling: {
      autoRetryFailed: settings.erpnext?.errorHandling?.autoRetryFailed ?? true,
      maxRetryAttempts: settings.erpnext?.errorHandling?.maxRetryAttempts || 3,
      retryDelay: settings.erpnext?.errorHandling?.retryDelay || 5,
      notifyOnFailure: settings.erpnext?.errorHandling?.notifyOnFailure ?? true,
      notificationChannels: settings.erpnext?.errorHandling?.notificationChannels || ['email'],
      notificationEmail: settings.erpnext?.errorHandling?.notificationEmail || '',
      slackWebhookUrl: settings.erpnext?.errorHandling?.slackWebhookUrl || '',
      customWebhookUrl: settings.erpnext?.errorHandling?.customWebhookUrl || ''
    },
    
    // Advanced
    advanced: {
      enableDebugMode: settings.erpnext?.advanced?.enableDebugMode ?? false,
      enableProfiling: settings.erpnext?.advanced?.enableProfiling ?? false,
      enableQueryLogging: settings.erpnext?.advanced?.enableQueryLogging ?? false,
      enablePerformanceMetrics: settings.erpnext?.advanced?.enablePerformanceMetrics ?? true,
      customHeaders: settings.erpnext?.advanced?.customHeaders || {},
      customParameters: settings.erpnext?.advanced?.customParameters || {},
      plugins: settings.erpnext?.advanced?.plugins || [],
      featureFlags: settings.erpnext?.advanced?.featureFlags || {}
    },
    
    // Metadata
    metadata: {
      createdAt: settings.erpnext?.metadata?.createdAt || new Date(),
      updatedAt: settings.erpnext?.metadata?.updatedAt || new Date(),
      createdBy: settings.erpnext?.metadata?.createdBy || 'system',
      updatedBy: settings.erpnext?.metadata?.updatedBy || 'system',
      version: settings.erpnext?.metadata?.version || '1.0.0',
      tags: settings.erpnext?.metadata?.tags || ['erpnext', 'integration']
    }
  });
  
  // Setup wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [isSetupComplete, setIsSetupComplete] = useState(!!settings.erpnext?.url);
  
  // UI state
  const [isTesting, setIsTesting] = useState(false);
  const [isLoadingLedgers, setIsLoadingLedgers] = useState(false);
  const [erpVersion, setErpVersion] = useState('v14');
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [ledgers, setLedgers] = useState<LedgerItem[]>([]);
  const [availableLedgers, setAvailableLedgers] = useState<LedgerItem[]>([]);
  const [newLedger, setNewLedger] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>({
    success: false,
    message: '',
    version: '',
    serverInfo: {}
  });

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced(prev => !prev);
  }, []);

  const handleVersionChange = useCallback((event: SelectChangeEvent) => {
    const version = event.target.value as string;
    setErpVersion(version);
  }, []);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSslToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const verifySSL = event.target.checked;
    setFormData(prev => ({
      ...prev,
      verifySSL
    }));
  }, []);

  const handleTimeoutChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const timeout = parseInt(event.target.value, 10) || 30;
    setFormData(prev => ({
      ...prev,
      connectionTimeout: timeout
    }));
  }, []);

  const handleSelectChange = useCallback((event: SelectChangeEvent<string | string[]>) => {
    const { name, value } = event.target;
    
    if (name === 'defaultLedgers') {
      setFormData(prev => ({
        ...prev,
        defaultLedgers: typeof value === 'string' ? value.split(',') : value as string[]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name as string]: value
      }));
    }
  }, []);

  const handleLedgerChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewLedger(event.target.value);
  }, []);

  const handleAddLedger = useCallback(() => {
    if (newLedger && !formData.defaultLedgers.includes(newLedger)) {
      setFormData(prev => ({
        ...prev,
        defaultLedgers: [...prev.defaultLedgers, newLedger]
      }));
      setNewLedger('');
    }
  }, [newLedger, formData.defaultLedgers]);

  const removeLedger = useCallback((ledgerToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      defaultLedgers: prev.defaultLedgers.filter(ledger => ledger !== ledgerToRemove)
    }));
  }, []);

  const handleTestConnection = useCallback(async () => {
    setIsTesting(true);
    
    try {
      // Simulate API call to test connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestResult({
        success: true,
        message: 'Connection successful!',
        version: erpVersion,
        serverInfo: { message: 'pong' }
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection failed. Please check your settings.',
        serverInfo: {}
      });
    } finally {
      setIsTesting(false);
    }
  }, [erpVersion]);

  const handleSave = useCallback(async () => {
    try {
      await saveSettings({ erpnext: formData });
      setTestResult({
        success: true,
        message: 'Settings saved successfully!',
        version: erpVersion,
        serverInfo: {}
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setTestResult({
        success: false,
        message: 'Failed to save settings. Please try again.',
        serverInfo: {}
      });
    }
  }, [formData, erpVersion, saveSettings]);

  const fetchLedgers = useCallback(async () => {
    if (!formData.url || !formData.apiKey || !formData.apiSecret || !formData.company) {
      console.error('Missing required fields for fetching ledgers');
      return;
    }

    setIsLoadingLedgers(true);
    try {
      // Simulate API call to fetch ledgers
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockLedgers: LedgerItem[] = [
        { name: 'Debtors', account_name: 'Debtors' },
        { name: 'Creditors', account_name: 'Creditors' },
        { name: 'Sales', account_name: 'Sales' },
        { name: 'Purchases', account_name: 'Purchases' },
      ];
      setAvailableLedgers(mockLedgers);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      setTestResult({
        success: false,
        message: 'Failed to fetch ledgers. Please check your connection.',
        serverInfo: {}
      });
    } finally {
      setIsLoadingLedgers(false);
    }
  }, [formData.url, formData.apiKey, formData.apiSecret, formData.company]);

  // Fetch ledgers when component mounts or when dependencies change
  useEffect(() => {
    if (formData.url && formData.apiKey && formData.apiSecret && formData.company) {
      fetchLedgers();
    }
  }, [fetchLedgers]);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSave();
      setIsSetupComplete(true);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Step 1: ERPNext Server Details
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Enter your ERPNext server URL and API credentials. You can find these in your ERPNext instance under:
              <br />
              <strong>Settings &gt; Integrations &gt; API Access</strong>
            </Typography>
            
            <GridContainer spacing={3}>
              <GridItem xs={12}>
                <TextField
                  fullWidth
                  label="ERPNext URL"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://your-erpnext-instance.com"
                  margin="normal"
                  required
                  helperText="Enter the base URL of your ERPNext instance"
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API Key"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleChange}
                  margin="normal"
                  required
                  helperText="Found in ERPNext under Settings > Integrations > API Access > Generate Keys"
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API Secret"
                  name="apiSecret"
                  type={showApiSecret ? 'text' : 'password'}
                  value={formData.apiSecret}
                  onChange={handleChange}
                  margin="normal"
                  required
                  helperText="Copy the API Secret from the same location as the API Key"
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
              </GridItem>
            </GridContainer>
          </>
        );
        
      case 1:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Step 2: Company & Configuration
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Configure company-specific settings and synchronization options.
            </Typography>
            
            <GridContainer spacing={3}>
              <GridItem xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  margin="normal"
                  required
                  helperText="Enter your company name as it appears in ERPNext"
                />
              </GridItem>
              
              <GridItem xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="erp-version-label">ERPNext Version</InputLabel>
                  <Select
                    labelId="erp-version-label"
                    value={erpVersion}
                    label="ERPNext Version"
                    onChange={handleVersionChange}
                    fullWidth
                  >
                    {ERP_NEXT_VERSIONS.map((version) => (
                      <MenuItem key={version.version} value={version.version}>
                        {version.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select your ERPNext version</FormHelperText>
                </FormControl>
              </GridItem>
              
              <GridItem xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.verifySSL}
                      onChange={handleSslToggle}
                      name="verifySSL"
                      color="primary"
                    />
                  }
                  label="Verify SSL Certificate"
                />
                <FormHelperText>
                  {formData.verifySSL 
                    ? 'SSL certificates will be verified for secure connections.'
                    : 'Warning: Disabling SSL verification is not recommended for production use.'}
                </FormHelperText>
              </GridItem>
            </GridContainer>
          </>
        );
        
      case 2:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Step 3: Test Connection & Finish
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Test your connection to ERPNext and complete the setup.
            </Typography>
            
            <Box sx={{ mt: 3, mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleTestConnection}
                disabled={isTesting}
                startIcon={isTesting ? <CircularProgress size={20} /> : <VpnKeyIcon />}
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
              
              {testResult.message && (
                <Alert 
                  severity={testResult.success ? 'success' : 'error'} 
                  sx={{ mt: 2 }}
                >
                  {testResult.message}
                  {testResult.version && (
                    <Typography variant="body2">
                      Detected ERPNext version: {testResult.version}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
            
            <Collapse in={showAdvanced}>
              <Box sx={{ mt: 3, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Advanced Settings
                </Typography>
                <GridContainer spacing={3}>
                  <GridItem xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Sync Interval (minutes)"
                      name="syncInterval"
                      type="number"
                      value={formData.syncInterval}
                      onChange={handleChange}
                      margin="normal"
                      helperText="How often to sync with ERPNext (in minutes)"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Connection Timeout (seconds)"
                      name="connectionTimeout"
                      type="number"
                      value={formData.connectionTimeout}
                      onChange={handleTimeoutChange}
                      margin="normal"
                      helperText="API request timeout in seconds"
                    />
                  </GridItem>
                </GridContainer>
              </Box>
            </Collapse>
            
            <Button
              onClick={toggleAdvanced}
              startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              size="small"
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
          </>
        );
        
      default:
        return null;
    }
  };

  if (isSetupComplete) {
    return (
      <Box sx={{ width: '100%' }}>
        <Card>
          <CardHeader 
            title="ERPNext Integration" 
            subheader="Your ERPNext integration is configured"
            avatar={<CheckCircleIcon color="success" />}
          />
          <CardContent>
            <Typography paragraph>
              Successfully connected to ERPNext at: <strong>{formData.url}</strong>
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => setIsSetupComplete(false)}
              startIcon={<SettingsIcon />}
            >
              Edit Settings
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardHeader 
          title="ERPNext Setup" 
          subheader="Configure your ERPNext integration"
          avatar={<SettingsIcon />}
        />
        <CardContent>
          {/* Progress Stepper */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {['Server Details', 'Company', 'Test & Finish'].map((label, index) => (
                <Box key={label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: currentStep >= index ? 'primary.main' : 'action.disabledBackground',
                      color: currentStep >= index ? 'primary.contrastText' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography variant="caption" align="center">
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ width: '100%', height: 4, backgroundColor: 'divider', mt: 2, mb: 4 }} />
            
            {renderStepContent(currentStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={isTesting || !formData.url || !formData.apiKey || !formData.apiSecret}
                endIcon={currentStep === 2 ? <SaveIcon /> : <ChevronRightIcon />}
              >
                {currentStep === 2 ? 'Save & Finish' : 'Next'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardHeader 
          title="ERPNext Setup" 
          subheader="Configure your ERPNext integration"
          avatar={<SettingsIcon />}
        />
        <CardContent>
          {/* Progress Stepper */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {['Server Details', 'Company', 'Test & Finish'].map((label, index) => (
                <Box key={label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: currentStep >= index ? 'primary.main' : 'action.disabledBackground',
                      color: currentStep >= index ? 'primary.contrastText' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography variant="caption" align="center">
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ width: '100%', height: 4, backgroundColor: 'divider', mt: 2, mb: 4 }} />
            
            {renderStepContent(currentStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={isTesting || !formData.url || !formData.apiKey || !formData.apiSecret}
                endIcon={currentStep === 2 ? <SaveIcon /> : <ChevronRightIcon />}
              >
                {currentStep === 2 ? 'Save & Finish' : 'Next'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                        edge="end"
                      >
                        {showApiSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </GridItem>
            
            <GridItem xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formData.verifySSL}
                    onChange={handleSslToggle}
                    name="verifySSL"
                    color="primary"
                  />
                }
                label="Verify SSL Certificate"
              />
              <FormHelperText>
                Disable only if using a self-signed certificate in development
              </FormHelperText>
            </GridItem>
            
            <GridItem xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Advanced Settings</Typography>
                <IconButton onClick={toggleAdvanced}>
                  {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={showAdvanced}>
                <GridContainer spacing={3}>
                  <GridItem xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Connection Timeout (seconds)"
                      name="connectionTimeout"
                      type="number"
                      value={formData.connectionTimeout}
                      onChange={handleTimeoutChange}
                      margin="normal"
                      InputProps={{ inputProps: { min: 5, max: 120 } }}
                    />
                  </GridItem>
                  
                  <GridItem xs={12} sm={6} md={4}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>ERPNext Version</InputLabel>
                      <Select
                        value={erpVersion}
                        onChange={handleVersionChange}
                        label="ERPNext Version"
                      >
                        {ERP_NEXT_VERSIONS.map((version) => (
                          <MenuItem key={version.version} value={version.version}>
                            {version.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>
                </GridContainer>
              </Collapse>
            </GridItem>
            
            <GridItem xs={12}>
              <Box display="flex" gap={2} mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleTestConnection}
                  disabled={isTesting || !formData.url || !formData.apiKey || !formData.apiSecret}
                  startIcon={isTesting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
                
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSave}
                  disabled={isTesting || !formData.url || !formData.apiKey || !formData.apiSecret}
                  startIcon={<SaveIcon />}
                >
                  Save Settings
                </Button>
              </Box>
              
              {testResult.message && (
                <Alert 
                  severity={testResult.success ? 'success' : 'error'}
                  sx={{ mt: 2 }}
                  onClose={() => setTestResult(prev => ({ ...prev, message: '' }))}
                >
                  {testResult.message}
                </Alert>
              )}
            </GridItem>
          </GridContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ErpNextSettings;
