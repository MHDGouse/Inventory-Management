'use client';

import { useState, useEffect, useCallback } from 'react';
import api, { getCached } from '@/lib/api';

interface FetchOptions {
  cacheTime?: number;
  dedupingInterval?: number;
  initialData?: any;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
}

interface UseFetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
}

/**
 * Custom hook for data fetching with caching, revalidation, and error handling
 * @param url The URL to fetch
 * @param params Query parameters
 * @param options Additional options
 */
export function useFetch<T>(
  url: string,
  params: Record<string, any> = {},
  options: FetchOptions = {}
) {
  const {
    cacheTime = 300000, // 5 minutes
    dedupingInterval = 2000, // 2 seconds
    initialData = null,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
  } = options;

  const [state, setState] = useState<UseFetchState<T>>({
    data: initialData,
    error: null,
    isLoading: true,
    isValidating: false,
  });

  const fetchData = useCallback(async (shouldDedup = true) => {
    try {
      setState((prev) => ({
        ...prev,
        isValidating: true,
        ...(shouldDedup ? {} : { isLoading: true }),
      }));

      const data = await getCached<T>(url, params, cacheTime);

      setState({
        data,
        error: null,
        isLoading: false,
        isValidating: false,
      });
    } catch (error) {
      setState({
        data: state.data,
        error: error as Error,
        isLoading: false,
        isValidating: false,
      });
    }
  }, [url, params, cacheTime, state.data]);

  // Initial fetch
  useEffect(() => {
    let didCancel = false;
    let dedupeTimer: NodeJS.Timeout | null = null;

    if (!didCancel) {
      if (dedupeTimer) clearTimeout(dedupeTimer);
      
      dedupeTimer = setTimeout(() => {
        fetchData();
      }, dedupingInterval);
    }

    return () => {
      didCancel = true;
      if (dedupeTimer) clearTimeout(dedupeTimer);
    };
  }, [fetchData, dedupingInterval]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const onFocus = () => {
      fetchData(true);
    };

    window.addEventListener('focus', onFocus);
    
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchData, revalidateOnFocus]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const onOnline = () => {
      fetchData(true);
    };

    window.addEventListener('online', onOnline);
    
    return () => {
      window.removeEventListener('online', onOnline);
    };
  }, [fetchData, revalidateOnReconnect]);

  const refetch = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  return {
    ...state,
    refetch,
  };
}

/**
 * Custom hook for mutations (POST, PUT, DELETE)
 */
export function useMutation<T, D = any>(
  url: string,
  method: 'post' | 'put' | 'delete' = 'post'
) {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
  });

  const mutate = useCallback(
    async (data?: D) => {
      setState({ data: null, error: null, isLoading: true });

      try {
        let response;
        if (method === 'post') {
          response = await api.post<T>(url, data);
        } else if (method === 'put') {
          response = await api.put<T>(url, data);
        } else {
          // For delete, data is passed as config
          response = await api.delete<T>(url, { data });
        }
        
        setState({ data: response.data, error: null, isLoading: false });
        return response.data;
      } catch (error) {
        setState({ data: null, error: error as Error, isLoading: false });
        throw error;
      }
    },
    [url, method]
  );

  return {
    ...state,
    mutate,
  };
}
