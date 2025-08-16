import { useState, useEffect, useRef, useCallback } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeConfig {
  threshold?: number;
  velocity?: number;
  preventScroll?: boolean;
}

export function useSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  config: SwipeConfig = {}
) {
  const {
    threshold = 50,
    velocity = 0.3,
    preventScroll = false
  } = config;

  const touchStart = useRef<TouchPosition | null>(null);
  const touchEnd = useRef<TouchPosition | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    
    if (preventScroll) {
      e.preventDefault();
    }
  }, [preventScroll]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault();
    }
  }, [preventScroll]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;
    
    touchEnd.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < threshold) return;

    const time = Date.now();
    const touchDuration = time - (touchStart.current as any).time || 1;
    const velocityX = Math.abs(deltaX) / touchDuration;
    const velocityY = Math.abs(deltaY) / touchDuration;

    if (velocityX < velocity && velocityY < velocity) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeUp?.();
      } else {
        onSwipeDown?.();
      }
    }
  }, [threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}

export function useLongPress(
  onLongPress: () => void,
  delay: number = 500
) {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const start = useCallback(() => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsPressed(false);
    }, delay);
  }, [onLongPress, delay]);

  const stop = useCallback(() => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    isPressed,
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop
  };
}

export function usePinchZoom() {
  const [scale, setScale] = useState(1);
  const [lastDistance, setLastDistance] = useState(0);
  const [isZooming, setIsZooming] = useState(false);

  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    const deltaX = touch1.clientX - touch2.clientX;
    const deltaY = touch1.clientY - touch2.clientY;
    
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  };

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      setIsZooming(true);
      setLastDistance(getDistance(e.touches));
      e.preventDefault();
    }
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && isZooming) {
      const distance = getDistance(e.touches);
      
      if (lastDistance > 0) {
        const ratio = distance / lastDistance;
        setScale(prevScale => Math.max(0.5, Math.min(3, prevScale * ratio)));
      }
      
      setLastDistance(distance);
      e.preventDefault();
    }
  }, [isZooming, lastDistance]);

  const onTouchEnd = useCallback(() => {
    setIsZooming(false);
    setLastDistance(0);
  }, []);

  const reset = useCallback(() => {
    setScale(1);
  }, []);

  return {
    scale,
    isZooming,
    reset,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}

export function useDoubleTab(onDoubleTab: () => void, delay: number = 300) {
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const handleClick = useCallback(() => {
    setClickCount(prev => prev + 1);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (clickCount === 1) {
        onDoubleTab();
      }
      setClickCount(0);
    }, delay);
  }, [clickCount, onDoubleTab, delay]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { onClick: handleClick };
}

// Touch feedback for better UX
export function useTouchFeedback() {
  const [isPressed, setIsPressed] = useState(false);

  const onTouchStart = useCallback(() => {
    setIsPressed(true);
    
    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  return {
    isPressed,
    onTouchStart,
    onTouchEnd,
    className: isPressed ? 'scale-95 opacity-80' : ''
  };
}