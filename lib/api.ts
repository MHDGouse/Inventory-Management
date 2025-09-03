import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Define types for the cache
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// Create a configured axios instance
const api = axios.create({
  // Add your base URL if needed
  // baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh or other error handling logic here
    
    return Promise.reject(error);
  }
);

// For data caching
const cache = new Map<string, CacheEntry<any>>();

/**
 * Makes a GET request with built-in caching
 * @param url The URL to fetch
 * @param params Query parameters
 * @param ttl Time to live for cache in milliseconds (default: 5 minutes)
 */
export const getCached = async <T>(url: string, params: Record<string, any> = {}, ttl: number = 300000): Promise<T> => {
  const queryString = new URLSearchParams(params).toString();
  const cacheKey = `${url}?${queryString}`;
  
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  
  const response: AxiosResponse<T> = await api.get(url, { params });
  
  cache.set(cacheKey, {
    data: response.data,
    expiry: Date.now() + ttl
  });
  
  return response.data;
};

export default api;
