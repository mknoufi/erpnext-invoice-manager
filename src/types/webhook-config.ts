export interface WebhookConfig {
  enabled: boolean;
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  timeout?: number;
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
