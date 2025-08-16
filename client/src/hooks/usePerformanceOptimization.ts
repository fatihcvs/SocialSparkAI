import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { debounce, throttle } from 'lodash-es';

/**
 * Performance optimization hooks for React components
 */

/**
 * Optimized debounce hook with cleanup
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
) {
  const debouncedFn = useMemo(
    () => debounce(callback, delay),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps]
  );

  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return debouncedFn;
}

/**
 * Optimized throttle hook with cleanup
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
) {
  const throttledFn = useMemo(
    () => throttle(callback, delay),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps]
  );

  useEffect(() => {
    return () => {
      throttledFn.cancel();
    };
  }, [throttledFn]);

  return throttledFn;
}

/**
 * Hook for expensive computations with memoization
 */
export function useExpensiveComputation<T>(
  computeFn: () => T,
  deps: React.DependencyList
): T {
  return useMemo(computeFn, deps);
}

/**
 * Hook for stable callback references
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Hook for intersection observer (lazy loading, infinite scroll)
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<Element | null>(null);

  const updateEntry = useCallback(([entry]: IntersectionObserverEntry[]) => {
    setEntry(entry);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(updateEntry, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [updateEntry, options]);

  return [elementRef, entry] as const;
}

/**
 * Hook for optimized image loading
 */
export function useOptimizedImage(src: string, options: {
  placeholder?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
} = {}) {
  const [imageState, setImageState] = useState<{
    src: string;
    isLoading: boolean;
    hasError: boolean;
  }>({
    src: options.placeholder || '',
    isLoading: true,
    hasError: false,
  });

  useEffect(() => {
    if (!src) return;

    setImageState(prev => ({ ...prev, isLoading: true, hasError: false }));

    const img = new Image();
    
    img.onload = () => {
      setImageState({
        src,
        isLoading: false,
        hasError: false,
      });
    };

    img.onerror = () => {
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
      }));
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return imageState;
}

/**
 * Hook for virtual scrolling optimization
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useThrottle((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, 16); // 60fps

  return {
    ...visibleItems,
    handleScroll,
  };
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
  });

  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    console.log(`${componentName} mounted in ${mountTime}ms`);

    return () => {
      console.log(`${componentName} rendered ${renderCountRef.current} times`);
    };
  }, [componentName]);

  return {
    renderCount: renderCountRef.current,
    mountTime: Date.now() - mountTimeRef.current,
  };
}

