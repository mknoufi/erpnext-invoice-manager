import apiClient, { apiWithRetry, ApiError } from './client';
import type {
  CashierSession,
  InvoiceSummary,
  PaymentEntry,
  PayoutEntry,
  CashInHand,
  EODReport,
  ManagerApprovalRequest,
} from '../types/pos';
import { fetchPaymentModes, fetchLedgerAccounts, fetchCurrencies, createPaymentEntry, createJournalEntry } from './erpnextSettingsService';

// Enhanced error handling for POS operations
export class PosServiceError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
    public operation?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'PosServiceError';
  }
}

// Service configuration
const POS_SERVICE_CONFIG = {
  logErrors: true,
  retryFailedOperations: true,
  maxRetries: 3,
  retryDelay: 1000,
};

const posService = {
  // Session & PIN
  async loginWithPin(pin: string): Promise<CashierSession> {
    try {
      const { data } = await apiWithRetry.post('/pos/session/pin-login', { pin });
      
      if (POS_SERVICE_CONFIG.logErrors) {
        console.log('Successfully logged in with PIN');
      }
      
      return data;
    } catch (error) {
      if (POS_SERVICE_CONFIG.logErrors) {
        console.error('Error during PIN login:', error);
      }

      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new PosServiceError('Invalid PIN. Please check your PIN and try again.', error, 'loginWithPin');
        } else if (error.status === 403) {
          throw new PosServiceError('Access denied. Please contact your administrator.', error, 'loginWithPin');
        } else if (error.status >= 500) {
          throw new PosServiceError('Server error during login. Please try again later.', error, 'loginWithPin', true);
        }
      }

      throw new PosServiceError(
        'Failed to login with PIN',
        error instanceof Error ? error : new Error(String(error)),
        'loginWithPin'
      );
    }
  },
  async closeSession(sessionId: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.post(`/pos/session/${sessionId}/close`);
    return data;
  },

  // Invoices
  async listTodayInvoices(params?: { search?: string }): Promise<InvoiceSummary[]> {
    const { data } = await apiClient.get('/pos/invoices/today', { params });
    return data;
  },
  async listPendingDeliveries(params?: { search?: string }): Promise<InvoiceSummary[]> {
    const { data } = await apiClient.get('/pos/invoices/pending-delivery', { params });
    return data;
  },
  async searchPendingCredit(params: { query: string }): Promise<InvoiceSummary[]> {
    const { data } = await apiClient.get('/pos/invoices/pending-credit', { params });
    return data;
  },

  // Discounts & approvals
  async applyBulkDiscount(invoiceIds: string[], totalDiscount: number): Promise<{
    updated: InvoiceSummary[];
  }> {
    const { data } = await apiClient.post('/pos/discounts/bulk', { invoiceIds, totalDiscount });
    return data;
  },
  async requestManagerApproval(payload: Omit<ManagerApprovalRequest, 'status' | 'createdAt' | 'requestId'>): Promise<ManagerApprovalRequest> {
    const { data } = await apiClient.post('/pos/approvals/request', payload);
    return data;
  },

  // Payments
  async recordPayment(entry: Omit<PaymentEntry, 'id' | 'createdAt'>): Promise<PaymentEntry> {
    try {
      const { data } = await apiWithRetry.post('/pos/payments', entry);
      
      if (POS_SERVICE_CONFIG.logErrors) {
        console.log(`Successfully recorded payment for invoice ${entry.invoiceId}`);
      }
      
      return data;
    } catch (error) {
      if (POS_SERVICE_CONFIG.logErrors) {
        console.error('Error recording payment:', error);
      }

      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new PosServiceError(
            'Invalid payment data. Please check the payment details and try again.',
            error,
            'recordPayment'
          );
        } else if (error.status === 404) {
          throw new PosServiceError(
            `Invoice ${entry.invoiceId} not found.`,
            error,
            'recordPayment'
          );
        } else if (error.status >= 500) {
          throw new PosServiceError(
            'Server error while recording payment. Please try again later.',
            error,
            'recordPayment',
            true
          );
        }
      }

      throw new PosServiceError(
        'Failed to record payment',
        error instanceof Error ? error : new Error(String(error)),
        'recordPayment'
      );
    }
  },
  async listPayments(params?: { sessionId?: string }): Promise<PaymentEntry[]> {
    const { data } = await apiClient.get('/pos/payments', { params });
    return data;
  },

  // Payouts
  async recordPayout(entry: Omit<PayoutEntry, 'id' | 'createdAt'>): Promise<PayoutEntry> {
    const { data } = await apiClient.post('/pos/payouts', entry);
    return data;
  },
  async listPayouts(params?: { sessionId?: string }): Promise<PayoutEntry[]> {
    const { data } = await apiClient.get('/pos/payouts', { params });
    return data;
  },

  // Cash counting
  async updateCashInHand(payload: Omit<CashInHand, 'total' | 'variance'> & { sessionId: string }): Promise<CashInHand> {
    const { data } = await apiClient.post('/pos/cash-in-hand', payload);
    return data;
  },
  async getCashInHand(sessionId: string): Promise<CashInHand> {
    const { data } = await apiClient.get(`/pos/cash-in-hand/${sessionId}`);
    return data;
  },

  // EOD
  async generateEOD(sessionId: string, options?: { shareWith?: string[] }): Promise<EODReport> {
    const { data } = await apiClient.post(`/pos/eod/${sessionId}`, options || {});
    return data;
  },

  // Sync hooks (polling endpoints)
  async syncInvoices(since?: string): Promise<{ invoices: InvoiceSummary[]; nextCursor?: string }> {
    const { data } = await apiClient.get('/pos/sync/invoices', { params: { since } });
    return data;
  },
  async syncPayments(since?: string): Promise<{ payments: PaymentEntry[]; nextCursor?: string }> {
    const { data } = await apiClient.get('/pos/sync/payments', { params: { since } });
    return data;
  },

  // Real ERPNext Integration
  async getERPNexSettings(): Promise<{
    paymentModes: any[];
    ledgerAccounts: any[];
    currencies: any[];
  }> {
    try {
      const [paymentModes, ledgerAccounts, currencies] = await Promise.all([
        fetchPaymentModes(),
        fetchLedgerAccounts(),
        fetchCurrencies()
      ]);
      
      if (POS_SERVICE_CONFIG.logErrors) {
        console.log('Successfully fetched ERPNext settings');
      }
      
      return { paymentModes, ledgerAccounts, currencies };
    } catch (error) {
      if (POS_SERVICE_CONFIG.logErrors) {
        console.error('Error fetching ERPNext settings:', error);
      }

      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new PosServiceError(
            'Authentication failed. Please check your ERPNext credentials.',
            error,
            'getERPNexSettings'
          );
        } else if (error.status === 403) {
          throw new PosServiceError(
            'Permission denied. Please check your ERPNext permissions.',
            error,
            'getERPNexSettings'
          );
        }
      }

      throw new PosServiceError(
        'Failed to fetch ERPNext settings',
        error instanceof Error ? error : new Error(String(error)),
        'getERPNexSettings'
      );
    }
  },

  // Reverse Sync - Send data back to ERPNext
  async reverseSyncPayment(payment: PaymentEntry): Promise<{ success: boolean; entryId: string }> {
    try {
      const paymentData = {
        payment_type: 'Receive' as const,
        party_type: 'Customer' as const,
        party: 'Customer', // This would need to be determined from the invoice
        mode_of_payment: payment.mode,
        paid_amount: payment.amount.value,
        received_amount: payment.amount.value,
        references: [{
          reference_doctype: 'Sales Invoice',
          reference_name: payment.invoiceId,
          allocated_amount: payment.amount.value
        }],
        posting_date: payment.createdAt.split('T')[0],
        company: 'Your Company',
        currency: payment.amount.currency
      };

      const result = await createPaymentEntry(paymentData);
      
      if (POS_SERVICE_CONFIG.logErrors) {
        console.log(`Successfully synced payment ${payment.id} to ERPNext`);
      }
      
      return { success: true, entryId: result.name };
    } catch (error) {
      if (POS_SERVICE_CONFIG.logErrors) {
        console.error('Error in reverse sync payment:', error);
      }

      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new PosServiceError(
            'Invalid payment data for ERPNext sync. Please check the payment details.',
            error,
            'reverseSyncPayment'
          );
        } else if (error.status === 404) {
          throw new PosServiceError(
            `Referenced invoice ${payment.invoiceId} not found in ERPNext.`,
            error,
            'reverseSyncPayment'
          );
        } else if (error.status >= 500) {
          throw new PosServiceError(
            'ERPNext server error during payment sync. Please try again later.',
            error,
            'reverseSyncPayment',
            true
          );
        }
      }

      throw new PosServiceError(
        'Failed to sync payment to ERPNext',
        error instanceof Error ? error : new Error(String(error)),
        'reverseSyncPayment'
      );
    }
  },

  async reverseSyncPayout(payout: PayoutEntry): Promise<{ success: boolean; entryId: string }> {
    try {
      const journalData = {
        posting_date: payout.createdAt.split('T')[0],
        company: 'Your Company',
        accounts: [
          {
            account: 'Expense Account', // This would need to be determined based on purpose
            debit_in_account_currency: payout.amount.value,
            credit_in_account_currency: 0
          },
          {
            account: 'Cash',
            debit_in_account_currency: 0,
            credit_in_account_currency: payout.amount.value
          }
        ],
        user_remark: `${payout.type} Payout: ${payout.purpose}${payout.reference ? ` - ${payout.reference}` : ''}`
      };

      const result = await createJournalEntry(journalData);
      return { success: true, entryId: result.name };
    } catch (error) {
      console.error('Error in reverse sync payout:', error);
      throw new Error('Failed to sync payout to ERPNext');
    }
  },

  // Bulk reverse sync
  async bulkReverseSync(operations: {
    payments?: PaymentEntry[];
    payouts?: PayoutEntry[];
  }): Promise<{ 
    success: boolean; 
    results: { 
      payments: Array<{ success: boolean; entryId?: string; error?: string }>;
      payouts: Array<{ success: boolean; entryId?: string; error?: string }>;
    }
  }> {
    const results = {
      payments: [] as Array<{ success: boolean; entryId?: string; error?: string }>,
      payouts: [] as Array<{ success: boolean; entryId?: string; error?: string }>
    };

    try {
      // Sync payments
      if (operations.payments) {
        for (const payment of operations.payments) {
          try {
            const result = await this.reverseSyncPayment(payment);
            results.payments.push({ success: true, entryId: result.entryId });
          } catch (error) {
            results.payments.push({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        }
      }

      // Sync payouts
      if (operations.payouts) {
        for (const payout of operations.payouts) {
          try {
            const result = await this.reverseSyncPayout(payout);
            results.payouts.push({ success: true, entryId: result.entryId });
          } catch (error) {
            results.payouts.push({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        }
      }

      const allSuccessful = [
        ...results.payments,
        ...results.payouts
      ].every(result => result.success);

      return { success: allSuccessful, results };
    } catch (error) {
      console.error('Error in bulk reverse sync:', error);
      throw new Error('Failed to perform bulk reverse sync');
    }
  },
};

export default posService;


