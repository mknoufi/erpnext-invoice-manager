import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const baseURL = process.env.REACT_APP_ERPNEXT_URL;

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public retryable: boolean = false,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx status codes
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }
};

// Retry function
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.maxRetries,
  delay: number = RETRY_CONFIG.retryDelay
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const isRetryable = error instanceof ApiError ? error.retryable : RETRY_CONFIG.retryCondition(error as AxiosError);
      
      if (isLastAttempt || !isRetryable) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Max retry attempts exceeded');
};

const api: AxiosInstance = axios.create({
  baseURL: `${baseURL}/api/resource`,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = `${process.env.REACT_APP_API_KEY}:${process.env.REACT_APP_API_SECRET}`;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `token ${token}`;
    }
    
    // Add request timestamp for debugging
    (config as any).metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful requests in development
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - ((response.config as any).metadata?.startTime || 0);
      console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Log errors
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });

    // Transform error to ApiError
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const message = data?.message || data?.exc || error.message || 'API Error';
      const code = data?.code || 'UNKNOWN_ERROR';
      const retryable = status >= 500 && status < 600;

      throw new ApiError(message, status, code, retryable, data);
    } else if (error.request) {
      // Network error
      throw new ApiError('Network Error - Please check your connection', 0, 'NETWORK_ERROR', true);
    } else {
      // Other error
      throw new ApiError(error.message || 'Unknown Error', 0, 'UNKNOWN_ERROR', false);
    }
  }
);

// Enhanced API methods with retry logic
export const apiWithRetry = {
  get: <T = any>(url: string, config?: any) => 
    retryRequest(() => api.get<T>(url, config)),
  
  post: <T = any>(url: string, data?: any, config?: any) => 
    retryRequest(() => api.post<T>(url, data, config)),
  
  put: <T = any>(url: string, data?: any, config?: any) => 
    retryRequest(() => api.put<T>(url, data, config)),
  
  delete: <T = any>(url: string, config?: any) => 
    retryRequest(() => api.delete<T>(url, config)),
};

export default api;
