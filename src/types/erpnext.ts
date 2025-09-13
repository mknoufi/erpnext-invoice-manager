// Re-export all types from their respective modules
export * from './field-types';
export * from './sync-schedule';
export * from './webhook-config';
export * from './api-rate-limit';
export * from './data-encryption';
export * from './performance-settings';
export * from './monitoring-settings';

export * from './erpnext-settings';
  lastStatus?: 'success' | 'failed' | 'in-progress';
  lastErrorMessage?: string;
  syncWindow?: {
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    timezone: string;  // IANA timezone
  };
  startTime: string;
  endTime: string;
  timezone: string;
  daysOfWeek?: number[]; // 0-6 where 0 is Sunday
  excludeHolidays?: boolean;
  maxRetryAttempts?: number;
  retryDelay?: number; // minutes
  batchSize?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface WebhookConfig {
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

export interface ApiRateLimit {
  enabled: boolean;
  requestsPerMinute: number;
  throttleDelay: number; // milliseconds
}

export interface DataEncryption {
  enabled: boolean;
  algorithm: 'aes-256-gcm' | 'aes-128-gcm';
  keyRotationDays: number;
}

export interface PerformanceSettings {
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

export interface MonitoringSettings {
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

// Base interface for ERPNext settings
export interface ErpNextSettingsBase {
  // Connection
  url: string;
  apiKey: string;
  apiSecret: string;
  company: string;
  defaultLedgers?: string[];
  syncInterval?: number;
  verifySSL?: boolean;
  connectionTimeout?: number;
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
  fieldGroups: Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
    fields: string[];
  }>;
  
  // Webhook Configuration
  webhook: WebhookConfig;
  
  // API Configuration
  apiConfig: {
    basePath: string;
    version: string;
    timeout: number; // seconds
    retryPolicy: {
      maxRetries: number;
      retryDelay: number; // seconds
      backoffFactor: number;
    };
    rateLimiting: ApiRateLimit;
    compression: boolean;
    keepAlive: boolean;
  };
  
  // Add any additional properties that might be present in the settings
  [key: string]: any;
  
  // Security Settings
  security: {
    verifySSL: boolean;
    enableCORS: boolean;
    allowedOrigins: string[];
    enableCSRF: boolean;
    dataEncryption: DataEncryption;
    ipWhitelist: string[];
    userAgentFiltering: boolean;
  };
  
  // Performance Settings
  performance: PerformanceSettings;
  
  // Monitoring Settings
  monitoring: MonitoringSettings;
  
  // Logging Configuration
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    enableRequestLogging: boolean;
    enableAuditLogging: boolean;
    logRetentionDays: number;
    logFormat: 'json' | 'text';
    logToConsole: boolean;
    logToFile: boolean;
    logFilePath: string;
  };
  
  // Caching Configuration
  caching: {
    enabled: boolean;
    provider: 'memory' | 'redis' | 'memcached' | 'custom';
    ttl: number; // minutes
    namespaced: boolean;
    namespace: string;
    encryption: boolean;
    compression: boolean;
  };
  
  // Error Handling
  errorHandling: {
    autoRetryFailed: boolean;
    maxRetryAttempts: number;
    retryDelay: number; // seconds
    notifyOnFailure: boolean;
    notificationChannels: Array<'email' | 'slack' | 'webhook'>;
    notificationEmail?: string;
    slackWebhookUrl?: string;
    customWebhookUrl?: string;
  };
  
  // Advanced Settings
  advanced: {
    enableDebugMode: boolean;
    enableProfiling: boolean;
    enableQueryLogging: boolean;
    enablePerformanceMetrics: boolean;
    customHeaders: Record<string, string>;
    customParameters: Record<string, any>;
    plugins: string[];
    featureFlags: Record<string, boolean>;
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    version: string;
    tags: string[];
  };
}

// Extend the base interface for the actual settings
export interface ErpNextSettings extends ErpNextSettingsBase {
  // Add any additional properties specific to the extended interface
}

// Test result interface
export interface TestResult {
  success: boolean;
  message: string;
  version?: string;
  serverInfo?: any;
}

export interface LedgerItem {
  name: string;
  account_name: string;
}
