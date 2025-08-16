import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EnhancedCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  value?: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  children?: React.ReactNode;
  className?: string;
  animated?: boolean;
  onClick?: () => void;
  gradient?: boolean;
}

export function EnhancedCard({
  title,
  description,
  icon: Icon,
  value,
  trend,
  children,
  className,
  animated = true,
  onClick,
  gradient = false
}: EnhancedCardProps) {
  const CardComponent = animated ? motion.div : "div";
  
  return (
    <CardComponent
      {...(animated && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
        whileHover: { y: -2, transition: { duration: 0.2 } }
      })}
      onClick={onClick}
      className={cn(
        "cursor-pointer",
        onClick && "hover:shadow-lg transition-shadow duration-200"
      )}
    >
      <Card className={cn(
        "relative overflow-hidden",
        gradient && "bg-gradient-to-br from-background to-muted/50",
        className
      )}>
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        )}
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </div>
          {Icon && (
            <Icon className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        
        <CardContent className="relative z-10">
          {value && (
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{value}</div>
              {trend && (
                <div className={cn(
                  "text-xs flex items-center",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  <span className={cn(
                    "mr-1",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {trend.isPositive ? "↗" : "↘"}
                  </span>
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
          )}
          {children}
        </CardContent>
      </Card>
    </CardComponent>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

export function StatCard({ title, value, icon: Icon, trend, color = "blue" }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/10 border-blue-200",
    green: "from-green-500/10 to-green-600/10 border-green-200",
    purple: "from-purple-500/10 to-purple-600/10 border-purple-200",
    orange: "from-orange-500/10 to-orange-600/10 border-orange-200",
    red: "from-red-500/10 to-red-600/10 border-red-200"
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600", 
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={cn(
        "bg-gradient-to-br border",
        colorClasses[color]
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-bold">
                  {value}
                </p>
                {trend && (
                  <div className={cn(
                    "text-sm flex items-center px-2 py-1 rounded-full",
                    trend.isPositive 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  )}>
                    <span className="mr-1">
                      {trend.isPositive ? "↗" : "↘"}
                    </span>
                    {Math.abs(trend.value)}%
                  </div>
                )}
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-full bg-white/50",
              iconColorClasses[color]
            )}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}