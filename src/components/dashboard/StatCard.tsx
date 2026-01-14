import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "destructive";
}

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "text-primary";
      case "destructive":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={`text-2xl font-bold ${getVariantStyles()}`}>{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-primary" : "text-destructive"
                }`}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${variant === "success" ? "bg-primary/10" : variant === "destructive" ? "bg-destructive/10" : "bg-secondary"}`}>
          <Icon className={`w-5 h-5 ${variant === "success" ? "text-primary" : variant === "destructive" ? "text-destructive" : "text-muted-foreground"}`} />
        </div>
      </div>
    </div>
  );
}
