import logger from '../utils/logger';

export interface AuditEvent {
  event: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  metadata: Record<string, any>;
}

export interface CashierAuditEvent extends AuditEvent {
  event: 'cashier_close_submitted' | 'cashier_close_verified' | 'cashier_close_rejected' | 'cashier_settings_updated';
  metadata: {
    cashierId?: string;
    closeId?: string;
    expectedAmount?: number;
    countedAmount?: number;
    variance?: number;
    journalEntryId?: string;
    rejectionReason?: string;
    settings?: Record<string, any>;
  };
}

class TelemetryService {
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_TELEMETRY === 'true';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Send audit event to telemetry service
   */
  async sendAuditEvent(event: AuditEvent): Promise<void> {
    if (!this.isEnabled) {
      logger.debug('Telemetry disabled, skipping audit event', { event: event.event });
      return;
    }

    try {
      // In a real implementation, this would send to your telemetry service
      // For now, we'll just log it and simulate a network call
      logger.info('audit_event', {
        ...event,
        sessionId: this.sessionId,
        userId: this.userId,
      });

      // Simulate sending to external service
      await this.simulateNetworkCall(event);
    } catch (error) {
      logger.error('Failed to send audit event', { error, event: event.event });
    }
  }

  /**
   * Send cashier-specific audit event
   */
  async sendCashierAuditEvent(event: CashierAuditEvent): Promise<void> {
    await this.sendAuditEvent(event);
  }

  /**
   * Track cashier close submission
   */
  async trackCashierCloseSubmitted(data: {
    cashierId: string;
    closeId: string;
    expectedAmount: number;
    countedAmount: number;
    variance: number;
  }): Promise<void> {
    await this.sendCashierAuditEvent({
      event: 'cashier_close_submitted',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: {
        ...data,
      },
    });
  }

  /**
   * Track cashier close verification
   */
  async trackCashierCloseVerified(data: {
    cashierId: string;
    closeId: string;
    journalEntryId: string;
    expectedAmount: number;
    countedAmount: number;
    variance: number;
  }): Promise<void> {
    await this.sendCashierAuditEvent({
      event: 'cashier_close_verified',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: {
        ...data,
      },
    });
  }

  /**
   * Track cashier close rejection
   */
  async trackCashierCloseRejected(data: {
    cashierId: string;
    closeId: string;
    rejectionReason: string;
    expectedAmount: number;
    countedAmount: number;
    variance: number;
  }): Promise<void> {
    await this.sendCashierAuditEvent({
      event: 'cashier_close_rejected',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: {
        ...data,
      },
    });
  }

  /**
   * Track settings update
   */
  async trackSettingsUpdated(data: {
    settings: Record<string, any>;
    previousSettings?: Record<string, any>;
  }): Promise<void> {
    await this.sendCashierAuditEvent({
      event: 'cashier_settings_updated',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: {
        ...data,
      },
    });
  }

  /**
   * Simulate network call to external telemetry service
   */
  private async simulateNetworkCall(event: AuditEvent): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real implementation, this would be:
    // await fetch('/api/telemetry/audit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // });
    
    logger.debug('Telemetry event sent', { event: event.event });
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Check if telemetry is enabled
   */
  isTelemetryEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const telemetryService = new TelemetryService();
export default telemetryService;
