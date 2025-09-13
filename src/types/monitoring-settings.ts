export interface MonitoringSettings {
  enableHealthChecks: boolean;
  healthCheckInterval: number;
  enableMetrics: boolean;
  metricsEndpoint: string;
  enableAlerting: boolean;
  alertThresholds: {
    errorRate: number; // percentage
    responseTime: number; // ms
    queueSize: number;
  };
}
