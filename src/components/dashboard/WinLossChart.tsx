import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export function WinLossChart() {
  const { winLoss } = useDashboardStats();
  const totalTrades = winLoss.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-container animate-fade-in">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-foreground">Win vs Loss</h3>
        <p className="text-sm text-muted-foreground mt-1">Trade outcome distribution</p>
      </div>
      <div className="h-[300px]">
        {totalTrades === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Add trades to see your win/loss ratio
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={winLoss} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {winLoss.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                formatter={(value: number, name: string) => [value, name]}
              />
              <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
