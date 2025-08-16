import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <Loader2 className={cn(
      "animate-spin text-muted-foreground",
      sizeClasses[size],
      className
    )} />
  );
}

interface LoadingDotsProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingDots({ size = "md", className }: LoadingDotsProps) {
  const dotSizeClasses = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3"
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            "bg-current rounded-full",
            dotSizeClasses[size]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export function LoadingCard({ lines = 3, showAvatar = false, className }: LoadingCardProps) {
  return (
    <div className={cn("p-4 border rounded-lg bg-background", className)}>
      <div className="animate-pulse">
        {showAvatar && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-muted rounded-full" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-4 bg-muted rounded",
                i === lines - 1 ? "w-3/4" : "w-full"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false,
  className,
  onClick 
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors duration-200",
        className
      )}
    >
      {loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mr-2"
        >
          <LoadingSpinner size="sm" />
        </motion.div>
      )}
      {children}
    </button>
  );
}

interface ProgressiveLoadingProps {
  steps: Array<{
    id: string;
    title: string;
    completed: boolean;
    loading: boolean;
  }>;
  className?: string;
}

export function ProgressiveLoading({ steps, className }: ProgressiveLoadingProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-3"
        >
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
            step.completed 
              ? "bg-green-100 text-green-700" 
              : step.loading
              ? "bg-blue-100 text-blue-700"
              : "bg-muted text-muted-foreground"
          )}>
            {step.completed ? (
              "✓"
            ) : step.loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              index + 1
            )}
          </div>
          
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              step.completed 
                ? "text-green-700" 
                : step.loading
                ? "text-blue-700"
                : "text-muted-foreground"
            )}>
              {step.title}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface RefreshButtonProps {
  onRefresh: () => void;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RefreshButton({ 
  onRefresh, 
  loading = false, 
  size = "md",
  className 
}: RefreshButtonProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className={cn(
        "p-2 rounded-md hover:bg-muted transition-colors duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <RefreshCw className={cn(
        sizeClasses[size],
        loading && "animate-spin"
      )} />
    </button>
  );
}