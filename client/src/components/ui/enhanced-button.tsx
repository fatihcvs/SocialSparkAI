import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { LoadingSpinner } from "./loading-states";

interface EnhancedButtonProps {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
  glow?: boolean;
}

export function EnhancedButton({
  children,
  variant = "default",
  size = "default",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className,
  onClick,
  animated = true,
  glow = false
}: EnhancedButtonProps) {
  const ButtonComponent = animated ? motion.button : "button";

  const gradientVariants = {
    gradient: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
  };

  const glowClass = glow 
    ? "shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow duration-300" 
    : "";

  const buttonProps = {
    ...(animated && {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      transition: { duration: 0.1 }
    }),
    onClick,
    disabled: disabled || loading,
    className: cn(
      // Base button styles
      "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      
      // Size variants
      {
        "h-10 px-4 py-2": size === "default",
        "h-9 rounded-md px-3": size === "sm", 
        "h-11 rounded-md px-8": size === "lg",
        "h-10 w-10": size === "icon"
      },
      
      // Color variants
      {
        "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
        "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
        "text-primary underline-offset-4 hover:underline": variant === "link"
      },
      
      variant === "gradient" && gradientVariants.gradient,
      glowClass,
      className
    )
  };

  return (
    <ButtonComponent {...buttonProps}>
      {loading && (
        <LoadingSpinner size="sm" className="mr-1" />
      )}
      
      {!loading && Icon && iconPosition === "left" && (
        <Icon className="h-4 w-4" />
      )}
      
      {children}
      
      {!loading && Icon && iconPosition === "right" && (
        <Icon className="h-4 w-4" />
      )}
    </ButtonComponent>
  );
}

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  tooltip?: string;
}

export function FloatingActionButton({
  icon: Icon,
  onClick,
  className,
  size = "md",
  tooltip
}: FloatingActionButtonProps) {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-14 w-14", 
    lg: "h-16 w-16"
  };

  const iconSizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={tooltip}
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full bg-primary text-primary-foreground",
        "shadow-lg hover:shadow-xl transition-shadow duration-300",
        "flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizeClasses[size]} />
    </motion.button>
  );
}

interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function ButtonGroup({ 
  children, 
  orientation = "horizontal",
  className 
}: ButtonGroupProps) {
  return (
    <div className={cn(
      "flex",
      orientation === "horizontal" ? "flex-row" : "flex-col",
      "[&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child):not(:last-child)]:rounded-none",
      orientation === "vertical" && "[&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md [&>*:first-child]:rounded-l-none [&>*:last-child]:rounded-r-none",
      "[&>*:not(:last-child)]:border-r-0",
      orientation === "vertical" && "[&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-b-0",
      className
    )}>
      {children}
    </div>
  );
}