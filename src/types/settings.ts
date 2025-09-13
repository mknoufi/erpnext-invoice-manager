import type { ErpNextSettings as BaseErpNextSettings } from './erpnext-settings';
import type { CashCounterSettings } from './cashier';

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: number;
  spacing: number;
}

export interface ErpNextSettings extends Omit<BaseErpNextSettings, 'defaultLedgers'> {
  /**
   * List of default ledger accounts to use for transactions
   * @example ['Debtors - ACME', 'Sales - ACME']
   */
  defaultLedgers: string[];
  
  /**
   * Sync interval in minutes
   * @minimum 1
   * @default 60
   */
  syncInterval: number;
  
  /**
   * Whether to verify SSL certificates when making API requests
   * @default true
   */
  verifySSL?: boolean;
  
  /**
   * Connection timeout in milliseconds
   * @minimum 1000
   * @default 30000
   */
  connectionTimeout?: number;
}

export interface UISettings {
  density: 'comfortable' | 'cozy' | 'compact';
  showNotifications: boolean;
  showRecentItems: boolean;
  itemsPerPage: number;
}

export interface FeatureFlags {
  advancedReporting: boolean;
  batchProcessing: boolean;
  apiAccess: boolean;
  auditLogs: boolean;
  notifications: boolean;
  darkMode: boolean;
  twoFactorAuth: boolean;
  [key: string]: boolean; // Allow dynamic feature flags
}

export interface AppSettings {
  /** Theme configuration */
  theme: ThemeSettings;
  
  /** ERPNext integration settings */
  erpnext: ErpNextSettings;
  
  /** User interface settings */
  ui: UISettings;
  
  /** Feature flags */
  features: FeatureFlags;
  
  /** Application version */
  version: string;
  
  /** Last upgrade timestamp */
  lastUpgraded?: string;
  
  /** Cash counter settings */
  cashCounter?: CashCounterSettings;
  
  /** Additional metadata */
  [key: string]: any;
}
