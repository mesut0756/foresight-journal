import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useTrades } from "@/hooks/useTrades";
import { EmptyState } from "@/components/EmptyState";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  const { pairPerformance, monthlyPerformance, isLoading } = useDashboardStats();
  const { trades } = useTrades();

  // Calculate win rate trend from trades
  const calculateWinRateTrend = () => {
    if (trades.length === 0) return [];
    
    const monthlyData: Record<string, { wins: number; total: number }> = {};
    
    trades.forEach(trade => {
      const date = new Date(trade.created_at);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { wins: 0, total: 0 };
      }
      
      monthlyData[monthKey].total++;
      if (trade.result === 'win') {
        monthlyData[monthKey].wins++;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0,
    }));
  };

  const winRateTrendData = calculateWinRateTrend();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (trades.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">Deep dive into your trading performance</p>
          </div>
          <EmptyState
            icon={BarChart3}
            title="No data yet"
            description="Start adding trades to see your analytics"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your trading performance</p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Performance by Pair */}
          <div className="chart-container animate-fade-in">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-foreground">Performance by Pair</h3>
              <p className="text-sm text-muted-foreground mt-1">Profit/Loss by currency pair</p>
            </div>
            <div className="h-[300px]">
              {pairPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pairPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="pair"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value}`, "Profit"]}
                    />
                    <Bar 
                      dataKey="profit" 
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No pair data available
                </div>
              )}
            </div>
          </div>

          {/* Monthly Performance */}
          <div className="chart-container animate-fade-in">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-foreground">Monthly Performance</h3>
              <p className="text-sm text-muted-foreground mt-1">Profit/Loss by month</p>
            </div>
            <div className="h-[300px]">
              {monthlyPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
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
                      formatter={(value: number, name: string) => [
                        name === "profit" ? `$${value}` : value,
                        name === "profit" ? "Profit" : "Trades"
                      ]}
                    />
                    <Bar 
                      dataKey="profit" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No monthly data available
                </div>
              )}
            </div>
          </div>

          {/* Win Rate Trend */}
          <div className="chart-container lg:col-span-2 animate-fade-in">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-foreground">Win Rate Trend</h3>
              <p className="text-sm text-muted-foreground mt-1">Your win rate evolution over time</p>
            </div>
            <div className="h-[300px]">
              {winRateTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={winRateTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Win Rate"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="winRate"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No win rate data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
