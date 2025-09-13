import apiClient from './client';
import { 
  CashierClosePayload, 
  CashierCloseResponse, 
  CashierVerificationPayload 
} from '../types/cashier';

/**
 * Submit cashier close for verification
 * @param payload Cashier close data
 * @returns Promise with response containing ID and status
 */
export const submitCashierClose = async (payload: CashierClosePayload): Promise<CashierCloseResponse> => {
  const response = await apiClient.post<CashierCloseResponse>('/cashier/close', payload);
  return response.data;
};

/**
 * Verify cashier close (accountant approval)
 * @param id Cashier close ID
 * @returns Promise with verification response
 */
export const verifyCashierClose = async (id: string): Promise<CashierCloseResponse> => {
  const response = await apiClient.post<CashierCloseResponse>(`/cashier/close/${id}/verify`);
  return response.data;
};

/**
 * Reject cashier close (accountant rejection)
 * @param payload Verification payload with rejection reason
 * @returns Promise with rejection response
 */
export const rejectCashierClose = async (payload: CashierVerificationPayload): Promise<CashierCloseResponse> => {
  const response = await apiClient.post<CashierCloseResponse>(`/cashier/close/${payload.id}/reject`, payload);
  return response.data;
};

/**
 * Get cashier close details by ID
 * @param id Cashier close ID
 * @returns Promise with cashier close details
 */
export const getCashierClose = async (id: string): Promise<CashierCloseResponse> => {
  const response = await apiClient.get<CashierCloseResponse>(`/cashier/close/${id}`);
  return response.data;
};

/**
 * Get list of pending cashier closes for verification
 * @returns Promise with list of pending closes
 */
export const getPendingCashierCloses = async (): Promise<CashierCloseResponse[]> => {
  const response = await apiClient.get<CashierCloseResponse[]>('/cashier/close/pending');
  return response.data;
};

/**
 * Get cashier close history
 * @param cashierId Optional cashier ID to filter
 * @param limit Optional limit for results
 * @returns Promise with cashier close history
 */
export const getCashierCloseHistory = async (
  cashierId?: string, 
  limit: number = 50
): Promise<CashierCloseResponse[]> => {
  const params = new URLSearchParams();
  if (cashierId) params.append('cashier_id', cashierId);
  params.append('limit', limit.toString());
  
  const response = await apiClient.get<CashierCloseResponse[]>(`/cashier/close/history?${params}`);
  return response.data;
};
