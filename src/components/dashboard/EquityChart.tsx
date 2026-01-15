import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export function EquityChart() {
  const { equityCurve } = useDashboardStats();

  return (
    <div className="chart-container animate-fade-in">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-foreground">Equity Curve</h3>
        <p className="text-sm text-muted-foreground mt-1">Account growth over time</p>
      </div>
      <div className="h-[300px]">
        {equityCurve.length <= 1 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Add trades to see your equity curve
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Equity"]}
              />
              <Line type="monotone" dataKey="equity" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
