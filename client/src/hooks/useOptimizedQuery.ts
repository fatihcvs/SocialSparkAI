import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";

interface UseOptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey'> {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export function useOptimizedQuery<T>(
  queryKey: string[],
  options?: UseOptimizedQueryOptions<T>
) {
  const optimizedOptions = useMemo(() => ({
    queryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options
  }), [queryKey, options]);

  return useQuery<T>(optimizedOptions);
}

export function useOptimizedMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: {
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: Error, variables: V) => void;
    onSettled?: (data: T | undefined, error: Error | null, variables: V) => void;
  }
) {
  // Implementation for optimized mutations if needed
  return {
    mutate: mutationFn,
    ...options
  };
}