// Re-import types to use in this file
import type { FieldMapping } from './field-types';
import type { SyncSchedule } from './sync-schedule';
import type { WebhookConfig } from './webhook-config';
import type { ApiRateLimit } from './api-rate-limit';
import type { DataEncryption } from './data-encryption';
import type { PerformanceSettings } from './performance-settings';
import type { MonitoringSettings } from './monitoring-settings';

// Export all types from their respective files
export * from './field-types';
export * from './sync-schedule';
export * from './webhook-config';
export * from './api-rate-limit';
export * from './data-encryption';
export * from './performance-settings';
export * from './monitoring-settings';

/**
 * Extended ERPNext settings that include all configuration options
 * for the ERPNext integration
 */
export interface ErpNextSettings {
  // Connection
  url: string;
  apiKey: string;
  apiSecret: string;
  company: string;
  version: string;
  defaultCurrency: string;
  
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
    fields: string[] 
  }>;
  
  // Webhook Configuration
  webhook: WebhookConfig;
  
  // API Configuration
  apiConfig: {
    basePath: string;
    version: string;
    timeout: number;
    retryPolicy: {
      maxRetries: number;
      retryDelay: number;
      backoffFactor: number;
    };
    rateLimiting: ApiRateLimit;
    compression: boolean;
    keepAlive: boolean;
  };
  
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
  
  // Logging Settings
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
  
  // Caching Settings
  caching: {
    enabled: boolean;
    provider: 'memory' | 'redis' | 'memcached' | 'custom';
    ttl: number;
    namespaced: boolean;
    namespace: string;
    encryption: boolean;
    compression: boolean;
  };
  
  // Error Handling
  errorHandling: {
    autoRetryFailed: boolean;
    maxRetryAttempts: number;
    retryDelay: number;
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
  
  // Additional custom fields
  syncInterval?: number;
  connectionTimeout?: number;
}

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
