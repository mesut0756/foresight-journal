import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { pairPerformanceData } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Target, DollarSign, BarChart3 } from "lucide-react";

export default function PairsAnalysis() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pairs Analysis</h1>
          <p className="text-muted-foreground mt-1">Performance breakdown by currency pair</p>
        </div>

        {/* Pair Performance Chart */}
        <div className="chart-container animate-fade-in">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-foreground">Profit by Pair</h3>
            <p className="text-sm text-muted-foreground mt-1">Compare profitability across pairs</p>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pairPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="pair"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value}`, "Profit"]}
                />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {pairPerformanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.profit >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pairs Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Pair Statistics</h3>
            <p className="text-sm text-muted-foreground mt-1">Detailed performance metrics per pair</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Pair
                    </div>
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Trades
                    </div>
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Target className="w-4 h-4" />
                      Win Rate
                    </div>
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="w-4 h-4" />
                      Profit/Loss
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pairPerformanceData.map((pair, index) => (
                  <tr 
                    key={pair.pair} 
                    className="trade-row border-b border-border/50 last:border-0"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono font-semibold text-foreground">{pair.pair}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-mono text-muted-foreground">{pair.trades}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${pair.winRate}%` }}
                          />
                        </div>
                        <span className="font-mono font-medium text-primary w-12 text-right">{pair.winRate}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-mono font-medium ${pair.profit >= 0 ? "profit-text" : "loss-text"}`}>
                        {pair.profit >= 0 ? "+" : ""}${pair.profit.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
