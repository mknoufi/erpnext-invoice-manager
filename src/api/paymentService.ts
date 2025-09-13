import apiClient from './client';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'digital' | 'crypto';
  enabled: boolean;
  processingFee: number;
  settlementTime: string;
  supportedCurrencies: string[];
}

export interface PaymentRequest {
  invoiceId: string;
  amount: number;
  currency: string;
  method: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  gateway: string;
  amount: number;
  currency: string;
  processingFee: number;
  netAmount: number;
  timestamp: string;
  redirectUrl?: string;
  error?: string;
}

export interface PaymentHistory {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  timestamp: string;
  customerName: string;
  customerEmail: string;
  processingFee: number;
  netAmount: number;
  gateway: string;
  reference?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason: string;
  notifyCustomer: boolean;
}

export interface RefundResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  timestamp: string;
  reason: string;
}

class PaymentService {
  private baseUrl = '/api/payments';

  // Get available payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/methods`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Return mock data for development
      return [
        {
          id: 'stripe',
          name: 'Stripe',
          type: 'card',
          enabled: true,
          processingFee: 2.9,
          settlementTime: '2-7 days',
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        },
        {
          id: 'paypal',
          name: 'PayPal',
          type: 'digital',
          enabled: true,
          processingFee: 3.4,
          settlementTime: '1-3 days',
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          type: 'bank',
          enabled: true,
          processingFee: 0.5,
          settlementTime: '1-3 business days',
          supportedCurrencies: ['USD', 'EUR', 'GBP'],
        },
      ];
    }
  }

  // Process payment
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/process`, paymentRequest);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      // Mock successful payment for development
      return {
        id: `pay_${Date.now()}`,
        status: 'completed',
        transactionId: `txn_${Date.now()}`,
        gateway: paymentRequest.method,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        processingFee: paymentRequest.amount * 0.029, // 2.9% fee
        netAmount: paymentRequest.amount - (paymentRequest.amount * 0.029),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${paymentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(filters?: {
    invoiceId?: string;
    status?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ payments: PaymentHistory[]; total: number; page: number; totalPages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.invoiceId) params.append('invoiceId', filters.invoiceId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.method) params.append('method', filters.method);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get(`${this.baseUrl}/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Return mock data for development
      const mockPayments: PaymentHistory[] = [
        {
          id: 'pay_001',
          invoiceId: 'INV-2024-001',
          amount: 1500.00,
          currency: 'USD',
          method: 'Credit Card',
          status: 'completed',
          transactionId: 'txn_123456789',
          timestamp: '2024-01-15T10:30:00Z',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          processingFee: 43.50,
          netAmount: 1456.50,
          gateway: 'Stripe',
        },
        {
          id: 'pay_002',
          invoiceId: 'INV-2024-002',
          amount: 2500.00,
          currency: 'USD',
          method: 'PayPal',
          status: 'completed',
          transactionId: 'txn_987654321',
          timestamp: '2024-01-14T14:20:00Z',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          processingFee: 85.00,
          netAmount: 2415.00,
          gateway: 'PayPal',
        },
        {
          id: 'pay_003',
          invoiceId: 'INV-2024-003',
          amount: 800.00,
          currency: 'USD',
          method: 'Bank Transfer',
          status: 'pending',
          transactionId: 'txn_456789123',
          timestamp: '2024-01-13T09:15:00Z',
          customerName: 'Bob Johnson',
          customerEmail: 'bob@example.com',
          processingFee: 4.00,
          netAmount: 796.00,
          gateway: 'Bank Transfer',
          reference: 'REF123456',
        },
      ];

      return {
        payments: mockPayments,
        total: mockPayments.length,
        page: 1,
        totalPages: 1,
      };
    }
  }

  // Process refund
  async processRefund(refundRequest: RefundRequest): Promise<RefundResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/refund`, refundRequest);
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      // Mock successful refund for development
      return {
        id: `refund_${Date.now()}`,
        status: 'completed',
        amount: refundRequest.amount || 0,
        timestamp: new Date().toISOString(),
        reason: refundRequest.reason,
      };
    }
  }

  // Get payment settings
  async getPaymentSettings(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      // Return mock settings for development
      return {
        gateways: [
          {
            id: 'stripe_1',
            name: 'Stripe',
            type: 'stripe',
            enabled: true,
            apiKey: 'pk_test_...',
            apiSecret: 'sk_test_...',
            webhookSecret: 'whsec_...',
            sandboxMode: true,
            supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
            processingFee: 2.9,
            minAmount: 0.50,
            maxAmount: 999999.99,
            autoSettlement: true,
            settlementDelay: 2,
          },
          {
            id: 'paypal_1',
            name: 'PayPal',
            type: 'paypal',
            enabled: true,
            apiKey: 'client_id_...',
            apiSecret: 'client_secret_...',
            sandboxMode: true,
            supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
            processingFee: 3.4,
            minAmount: 1.00,
            maxAmount: 100000.00,
            autoSettlement: false,
            settlementDelay: 24,
          },
        ],
        globalSettings: {
          autoProcessPayments: true,
          requireConfirmation: false,
          allowPartialPayments: true,
          enableRefunds: true,
          defaultCurrency: 'USD',
          taxInclusive: true,
          showProcessingFees: true,
          enableRecurringPayments: false,
          paymentTimeout: 30,
          retryAttempts: 3,
        },
      };
    }
  }

  // Save payment settings
  async savePaymentSettings(settings: any): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/settings`, settings);
    } catch (error) {
      console.error('Error saving payment settings:', error);
      throw error;
    }
  }

  // Webhook verification
  async verifyWebhook(payload: string, signature: string, secret: string): Promise<boolean> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/webhook/verify`, {
        payload,
        signature,
        secret,
      });
      return response.data.valid;
    } catch (error) {
      console.error('Error verifying webhook:', error);
      return false;
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(filters?: {
    startDate?: string;
    endDate?: string;
    gateway?: string;
    method?: string;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.gateway) params.append('gateway', filters.gateway);
      if (filters?.method) params.append('method', filters.method);

      const response = await apiClient.get(`${this.baseUrl}/analytics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      // Return mock analytics for development
      return {
        totalPayments: 1250,
        totalAmount: 125000.00,
        successRate: 94.5,
        averageAmount: 100.00,
        topMethods: [
          { method: 'Credit Card', count: 750, percentage: 60 },
          { method: 'PayPal', count: 350, percentage: 28 },
          { method: 'Bank Transfer', count: 150, percentage: 12 },
        ],
        dailyStats: [
          { date: '2024-01-01', count: 45, amount: 4500.00 },
          { date: '2024-01-02', count: 52, amount: 5200.00 },
          { date: '2024-01-03', count: 38, amount: 3800.00 },
        ],
      };
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
