import { cn } from "@/lib/utils";
import { motion, PanInfo, useAnimation, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

// Mobile-first responsive breakpoints
export const breakpoints = {
  xs: '320px',
  sm: '640px', 
  md: '768px',
  lg: '1024px',
  xl: '1280px'
};

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  swipeable?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function MobileCard({ 
  children, 
  className, 
  swipeable = false,
  onSwipeLeft,
  onSwipeRight 
}: MobileCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (info.offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    controls.start({ x: 0 });
  };

  return (
    <motion.div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
        "touch-manipulation select-none",
        "min-h-[60px] p-4",
        isPressed && "scale-95",
        className
      )}
      animate={controls}
      drag={swipeable ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={swipeable ? handleDragEnd : undefined}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
      whileTap={{ scale: 0.98 }}
    >
      {children}
      
      {swipeable && (
        <div className="absolute top-2 right-2 text-gray-400">
          <span className="text-xs">←→</span>
        </div>
      )}
    </motion.div>
  );
}

interface TouchButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function TouchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className
}: TouchButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground active:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground active:bg-secondary/80", 
    ghost: "bg-transparent active:bg-gray-100 dark:active:bg-gray-800"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm min-h-[40px]",
    md: "px-6 py-3 text-base min-h-[48px]",
    lg: "px-8 py-4 text-lg min-h-[56px]"
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg font-medium transition-colors",
        "touch-manipulation select-none",
        "active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
}

interface SwipeableTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function SwipeableTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className 
}: SwipeableTabsProps) {
  const [currentIndex, setCurrentIndex] = useState(
    tabs.findIndex(tab => tab.id === activeTab)
  );
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.x > threshold && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onTabChange(tabs[newIndex].id);
    } else if (info.offset.x < -threshold && currentIndex < tabs.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onTabChange(tabs[newIndex].id);
    }
    
    controls.start({ x: 0 });
  };

  useEffect(() => {
    const newIndex = tabs.findIndex(tab => tab.id === activeTab);
    setCurrentIndex(newIndex);
  }, [activeTab, tabs]);

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap",
              "border-b-2 transition-colors min-h-[48px]",
              tab.id === activeTab
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        animate={controls}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="relative overflow-hidden"
      >
        <div className="p-4">
          {tabs[currentIndex]?.content}
        </div>
        
        {/* Swipe Indicators */}
        <div className="flex justify-center space-x-2 pb-4">
          {tabs.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
              )}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileMenu({ isOpen, onClose, children }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Menu Panel */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl z-50 lg:hidden"
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="p-4 overflow-y-auto h-full pb-20">
          {children}
        </div>
      </motion.div>
    </>
  );
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    if (info.offset.y > 0) {
      setPullDistance(Math.min(info.offset.y, 100));
    }
  };

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (disabled || isRefreshing) return;
    
    if (pullDistance > 60) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  return (
    <motion.div
      ref={containerRef}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className="relative h-full overflow-auto"
    >
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-primary/10 transition-all duration-200"
          style={{ height: pullDistance }}
        >
          <div className="text-primary text-sm font-medium">
            {pullDistance > 60 ? "Release to refresh" : "Pull to refresh"}
          </div>
        </div>
      )}
      
      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-center bg-primary/10">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div style={{ paddingTop: isRefreshing ? 48 : pullDistance }}>
        {children}
      </div>
    </motion.div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 4,
  className 
}: ResponsiveGridProps) {
  const gridCols: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2", 
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6"
  };

  const gapClass = `gap-${gap}`;

  return (
    <div className={cn(
      "grid",
      gridCols[columns.xs || 1],
      columns.sm && `sm:${gridCols[columns.sm] || 'grid-cols-1'}`,
      columns.md && `md:${gridCols[columns.md] || 'grid-cols-1'}`,
      columns.lg && `lg:${gridCols[columns.lg] || 'grid-cols-1'}`,
      columns.xl && `xl:${gridCols[columns.xl] || 'grid-cols-1'}`,
      gapClass,
      className
    )}>
      {children}
    </div>
  );
}