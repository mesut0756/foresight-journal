import { Bell, AlertTriangle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRiskWarning } from "@/hooks/useRiskWarning";
import { useNavigate } from "react-router-dom";

export function RiskWarningBell() {
  const { warnings, hasWarning } = useRiskWarning();
  const navigate = useNavigate();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          aria-label="Risk notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {hasWarning && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm text-foreground">Risk Alerts</h4>
        </div>
        {hasWarning ? (
          <div className="p-2 space-y-2">
            {warnings.map((w) => (
              <button
                key={w.type}
                onClick={() => navigate("/risk-management")}
                className="w-full text-left flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/15 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {w.type} loss warning — {w.percentUsed}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{w.message}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">No risk alerts. You're within your limits.</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
