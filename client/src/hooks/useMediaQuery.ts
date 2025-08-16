import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);
    
    // Create listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }
    
    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

// Predefined breakpoint hooks
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}

export function useIsSmallScreen() {
  return useMediaQuery('(max-width: 640px)');
}

export function useIsLargeScreen() {
  return useMediaQuery('(min-width: 1280px)');
}

// Device orientation
export function useIsPortrait() {
  return useMediaQuery('(orientation: portrait)');
}

export function useIsLandscape() {
  return useMediaQuery('(orientation: landscape)');
}

// Reduced motion preference
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// Dark mode preference
export function usePrefersDark() {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

// Touch device detection
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}

// Responsive breakpoint object
export function useBreakpoint() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isSmallScreen = useIsSmallScreen();
  const isLargeScreen = useIsLargeScreen();

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    current: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  };
}