import { 
  CashierClosePayload, 
  CashierCloseResponse, 
  CashierVerificationPayload 
} from '../types/cashier';

// Mock data store
let cashierCloses: CashierCloseResponse[] = [];
let nextId = 1;

// Mock delay to simulate API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API endpoints for cashier operations
 * This simulates the backend API when ERPNext is not available
 */
export const cashierMockApi = {
  /**
   * Submit cashier close
   */
  async submitCashierClose(payload: CashierClosePayload): Promise<CashierCloseResponse> {
    await delay(500); // Simulate network delay
    
    const response: CashierCloseResponse = {
      id: `cc_${nextId++}`,
      status: 'requested',
      created_at: new Date().toISOString(),
      variance: payload.denominations.reduce((sum, d) => sum + d.total, 0) - payload.expected_total,
    };
    
    cashierCloses.push(response);
    
    console.log('Mock API: Cashier close submitted', {
      id: response.id,
      cashierId: payload.cashier_id,
      expectedTotal: payload.expected_total,
      variance: response.variance,
    });
    
    return response;
  },

  /**
   * Verify cashier close (approve)
   */
  async verifyCashierClose(id: string): Promise<CashierCloseResponse> {
    await delay(300);
    
    const closeIndex = cashierCloses.findIndex(cc => cc.id === id);
    if (closeIndex === -1) {
      throw new Error('Cashier close not found');
    }
    
    const journalEntryId = `JE_${Date.now()}`;
    const updatedClose: CashierCloseResponse = {
      ...cashierCloses[closeIndex],
      status: 'verified',
      journal_entry_id: journalEntryId,
    };
    
    cashierCloses[closeIndex] = updatedClose;
    
    console.log('Mock API: Cashier close verified', {
      id,
      journalEntryId,
      status: 'verified',
    });
    
    return updatedClose;
  },

  /**
   * Reject cashier close
   */
  async rejectCashierClose(payload: CashierVerificationPayload): Promise<CashierCloseResponse> {
    await delay(300);
    
    const closeIndex = cashierCloses.findIndex(cc => cc.id === payload.id);
    if (closeIndex === -1) {
      throw new Error('Cashier close not found');
    }
    
    const updatedClose: CashierCloseResponse = {
      ...cashierCloses[closeIndex],
      status: 'rejected',
    };
    
    cashierCloses[closeIndex] = updatedClose;
    
    console.log('Mock API: Cashier close rejected', {
      id: payload.id,
      notes: payload.notes,
      status: 'rejected',
    });
    
    return updatedClose;
  },

  /**
   * Get cashier close by ID
   */
  async getCashierClose(id: string): Promise<CashierCloseResponse> {
    await delay(200);
    
    const close = cashierCloses.find(cc => cc.id === id);
    if (!close) {
      throw new Error('Cashier close not found');
    }
    
    return close;
  },

  /**
   * Get pending cashier closes
   */
  async getPendingCashierCloses(): Promise<CashierCloseResponse[]> {
    await delay(200);
    
    return cashierCloses.filter(cc => cc.status === 'requested');
  },

  /**
   * Get cashier close history
   */
  async getCashierCloseHistory(cashierId?: string, limit: number = 50): Promise<CashierCloseResponse[]> {
    await delay(200);
    
    let filtered = [...cashierCloses];
    
    if (cashierId) {
      // In a real implementation, we'd filter by cashier_id
      // For mock, we'll return all closes
      console.log('Mock API: Filtering by cashier_id', cashierId);
    }
    
    return filtered
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  /**
   * Reset mock data (for testing)
   */
  reset(): void {
    cashierCloses = [];
    nextId = 1;
  },

  /**
   * Get all cashier closes (for debugging)
   */
  getAllCashierCloses(): CashierCloseResponse[] {
    return [...cashierCloses];
  },
};

// Export for use in tests or development
export default cashierMockApi;
