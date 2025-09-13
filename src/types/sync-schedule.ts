export interface SyncSchedule {
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
  startTime: string;
  endTime: string;
  timezone: string;
  daysOfWeek?: number[];
  excludeHolidays?: boolean;
  maxRetryAttempts?: number;
  retryDelay?: number;
  batchSize?: number;
  priority?: 'low' | 'normal' | 'high';
}
