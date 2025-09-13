export interface ApiRateLimit {
  enabled: boolean;
  requestsPerMinute: number;
  throttleDelay: number;
}
