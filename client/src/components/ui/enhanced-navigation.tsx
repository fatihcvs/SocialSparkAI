import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  disabled?: boolean;
}

interface EnhancedNavigationProps {
  items: NavItem[];
  orientation?: "horizontal" | "vertical";
  variant?: "pills" | "underline" | "background";
  className?: string;
}

export function EnhancedNavigation({
  items,
  orientation = "horizontal",
  variant = "pills",
  className
}: EnhancedNavigationProps) {
  const [location, setLocation] = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (href: string) => location === href;

  const navVariants = {
    pills: "bg-muted/50 rounded-lg p-1",
    underline: "border-b border-border",
    background: "bg-background"
  };

  const itemVariants = {
    pills: {
      base: "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active: "bg-background text-foreground shadow-sm",
      inactive: "text-muted-foreground hover:text-foreground hover:bg-background/50"
    },
    underline: {
      base: "border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-colors",
      active: "border-primary text-foreground",
      inactive: "text-muted-foreground hover:text-foreground hover:border-muted"
    },
    background: {
      base: "px-3 py-2 text-sm font-medium transition-colors rounded-md",
      active: "bg-primary text-primary-foreground",
      inactive: "text-muted-foreground hover:text-foreground hover:bg-muted"
    }
  };

  return (
    <nav className={cn(
      "flex relative",
      orientation === "horizontal" ? "flex-row" : "flex-col",
      navVariants[variant],
      className
    )}>
      {items.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            onClick={() => !item.disabled && setLocation(item.href)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            disabled={item.disabled}
            className={cn(
              "relative flex items-center gap-2",
              itemVariants[variant].base,
              active ? itemVariants[variant].active : itemVariants[variant].inactive,
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
            whileHover={!item.disabled ? { scale: 1.02 } : {}}
            whileTap={!item.disabled ? { scale: 0.98 } : {}}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
            
            {item.badge && item.badge > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {item.badge > 99 ? "99+" : item.badge}
              </motion.span>
            )}

            {/* Active indicator for pills variant */}
            {variant === "pills" && active && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-background rounded-md shadow-sm -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}

            {/* Hover effect */}
            {hoveredItem === item.id && !active && !item.disabled && (
              <motion.div
                layoutId="hoverTab"
                className="absolute inset-0 bg-muted/50 rounded-md -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const [, setLocation] = useLocation();

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center"
        >
          {index > 0 && (
            <span className="mx-2 text-muted-foreground/50">/</span>
          )}
          
          {item.href ? (
            <button
              onClick={() => setLocation(item.href!)}
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </motion.div>
      ))}
    </nav>
  );
}

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "secondary";
  badge?: number;
}

export function QuickAction({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = "default",
  badge 
}: QuickActionProps) {
  const variants = {
    default: "bg-background hover:bg-muted border border-border",
    primary: "bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary",
    secondary: "bg-secondary hover:bg-secondary/80 border border-secondary"
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-lg transition-colors",
        "min-h-[80px] min-w-[80px]",
        variants[variant]
      )}
    >
      <Icon className="h-6 w-6 mb-2" />
      <span className="text-xs font-medium text-center leading-tight">{label}</span>
      
      {badge && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
        >
          {badge > 99 ? "99+" : badge}
        </motion.span>
      )}
    </motion.button>
  );
}

interface StepIndicatorProps {
  steps: Array<{
    id: string;
    label: string;
    completed: boolean;
    active?: boolean;
  }>;
  className?: string;
}

export function StepIndicator({ steps, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step.completed 
                ? "bg-primary text-primary-foreground" 
                : step.active
                ? "bg-primary/20 text-primary border-2 border-primary"
                : "bg-muted text-muted-foreground"
            )}>
              {step.completed ? "✓" : index + 1}
            </div>
            <span className={cn(
              "mt-2 text-xs font-medium",
              step.active ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </motion.div>
          
          {index < steps.length - 1 && (
            <div className={cn(
              "h-px w-12 mx-4 transition-colors",
              step.completed ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}