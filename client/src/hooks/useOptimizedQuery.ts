import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

/**
 * Optimized query hook with intelligent caching and stale-while-revalidate
 */
export function useOptimizedQuery<TData = unknown, TError = unknown>(
  queryKey: QueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey'>
) {
  const optimizedOptions = useMemo(() => ({
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount: number, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  }), [options]);

  return useQuery({
    queryKey,
    ...optimizedOptions
  });
}

/**
 * Hook for caching user-specific data with longer TTL
 */
export function useUserDataQuery<TData = unknown, TError = unknown>(
  queryKey: QueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey'>
) {
  return useOptimizedQuery(queryKey, {
    staleTime: 15 * 60 * 1000, // 15 minutes for user data
    gcTime: 60 * 60 * 1000, // 1 hour
    ...options
  });
}

/**
 * Hook for real-time data that needs frequent updates
 */
export function useRealtimeQuery<TData = unknown, TError = unknown>(
  queryKey: QueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey'>
) {
  return useOptimizedQuery(queryKey, {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options
  });
}

/**
 * Hook for expensive operations with aggressive caching
 */
export function useExpensiveQuery<TData = unknown, TError = unknown>(
  queryKey: QueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey'>
) {
  return useOptimizedQuery(queryKey, {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: 1, // Only retry once for expensive operations
    ...options
  });
}