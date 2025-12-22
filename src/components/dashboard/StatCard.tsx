import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:shadow-md max-w-full",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs lg:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl lg:text-3xl font-bold text-foreground truncate">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs lg:text-sm font-medium truncate",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 shrink-0 ml-2">
          {icon}
        </div>
      </div>
    </div>
  );
}
