export interface PerformanceSettings {
  enableQueryOptimization: boolean;
  enableCompression: boolean;
  maxConcurrentRequests: number;
  requestTimeout: number;
  cacheStrategy: 'memory' | 'redis' | 'custom';
  batchProcessing: {
    enabled: boolean;
    size: number;
    delay: number; // ms
  };
}
