import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  animated?: boolean;
}

export function PageLayout({ children, className, animated = true }: PageLayoutProps) {
  const content = (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-background via-background to-muted/20",
      className
    )}>
      {children}
    </div>
  );

  if (!animated) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "min-h-screen bg-gradient-to-br from-background via-background to-muted/20",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface ContentWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  headerClassName?: string;
}

export function ContentWrapper({ 
  children, 
  title, 
  description, 
  action,
  className,
  headerClassName 
}: ContentWrapperProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description || action) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("flex items-center justify-between", headerClassName)}
        >
          <div className="space-y-1">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {action && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {action}
            </motion.div>
          )}
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface GridLayoutProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

export function GridLayout({ 
  children, 
  columns = 3, 
  gap = "md",
  className,
  animated = true 
}: GridLayoutProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8"
  };

  const gridContent = (
    <div className={cn(
      "grid",
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );

  if (!animated) return gridContent;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, staggerChildren: 0.1 }}
      className={cn(
        "grid",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
}

export function StaggeredList({ children, className, itemClassName }: StaggeredListProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
      className={cn("space-y-4", className)}
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={itemClassName}
            >
              {child}
            </motion.div>
          ))
        : children
      }
    </motion.div>
  );
}

interface AnimatedTabsProps {
  activeTab: string;
  children: ReactNode;
  className?: string;
}

export function AnimatedTabs({ activeTab, children, className }: AnimatedTabsProps) {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface FadeInSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeInSection({ children, delay = 0, className }: FadeInSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SlideInPanelProps {
  children: ReactNode;
  isOpen: boolean;
  direction?: "left" | "right" | "top" | "bottom";
  className?: string;
}

export function SlideInPanel({ 
  children, 
  isOpen, 
  direction = "right",
  className 
}: SlideInPanelProps) {
  const slideVariants = {
    left: { x: "-100%" },
    right: { x: "100%" },
    top: { y: "-100%" },
    bottom: { y: "100%" }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={slideVariants[direction]}
          animate={{ x: 0, y: 0 }}
          exit={slideVariants[direction]}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}