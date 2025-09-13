import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import cashierMockApi from '../mocks/cashierMock';
import logger from '../utils/logger';

/**
 * Mock API interceptor for development/testing
 * Intercepts cashier-related API calls and routes them to mock implementations
 */
export const setupMockInterceptor = () => {
  // Only set up mocks in development or when explicitly enabled
  if (process.env.NODE_ENV !== 'development' && !process.env.REACT_APP_USE_MOCK_API) {
    return;
  }

  const originalRequest = axios.request;

  // Override axios.request to intercept cashier API calls
  axios.request = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    const url = config.url || '';
    const method = config.method?.toLowerCase() || 'get';

    // Check if this is a cashier API call
    if (url.includes('/cashier/close')) {
      logger.debug('Mock API: Intercepting cashier API call', { url, method });
      
      try {
        let data: any;
        
        if (method === 'post' && url === '/cashier/close') {
          // Submit cashier close
          data = await cashierMockApi.submitCashierClose(config.data);
        } else if (method === 'post' && url.includes('/verify')) {
          // Verify cashier close
          const id = url.split('/')[3]; // Extract ID from /cashier/close/{id}/verify
          data = await cashierMockApi.verifyCashierClose(id);
        } else if (method === 'post' && url.includes('/reject')) {
          // Reject cashier close
          const id = url.split('/')[3]; // Extract ID from /cashier/close/{id}/reject
          data = await cashierMockApi.rejectCashierClose({ id, ...config.data });
        } else if (method === 'get' && url.includes('/pending')) {
          // Get pending closes
          data = await cashierMockApi.getPendingCashierCloses();
        } else if (method === 'get' && url.includes('/history')) {
          // Get history
          const params = new URLSearchParams(url.split('?')[1] || '');
          const cashierId = params.get('cashier_id') || undefined;
          const limit = parseInt(params.get('limit') || '50');
          data = await cashierMockApi.getCashierCloseHistory(cashierId, limit);
        } else if (method === 'get' && !url.includes('/pending') && !url.includes('/history')) {
          // Get specific cashier close
          const id = url.split('/').pop();
          if (id) {
            data = await cashierMockApi.getCashierClose(id);
          }
        } else {
          // Fall through to original request
          return originalRequest(config);
        }

        // Return mock response
        return {
          data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config as any,
        };
      } catch (error) {
        logger.error('Mock API: Error in cashier API call', { error, url, method });
        
        // Return error response
        return {
          data: { error: error instanceof Error ? error.message : 'Unknown error' },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: config as any,
        };
      }
    }

    // For non-cashier API calls, use original request
    return originalRequest(config);
  };

  logger.info('Mock API interceptor setup complete for cashier endpoints');
};

// Auto-setup in development
if (process.env.NODE_ENV === 'development') {
  setupMockInterceptor();
}
