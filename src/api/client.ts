import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const baseURL = process.env.REACT_APP_ERPNEXT_URL;

const api: AxiosInstance = axios.create({
  baseURL: `${baseURL}/api/resource`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = `${process.env.REACT_APP_API_KEY}:${process.env.REACT_APP_API_SECRET}`;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `token ${token}`;
  }
  return config;
});

export default api;
