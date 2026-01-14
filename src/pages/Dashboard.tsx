import { TrendingUp, Target, DollarSign, TrendingDown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { WinLossChart } from "@/components/dashboard/WinLossChart";
import { RecentTradesTable } from "@/components/dashboard/RecentTradesTable";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your trading overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Trades"
            value="248"
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Win Rate"
            value="68%"
            icon={Target}
            variant="success"
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Total Profit"
            value="$12,450"
            icon={DollarSign}
            variant="success"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Max Drawdown"
            value="8.2%"
            icon={TrendingDown}
            variant="destructive"
            trend={{ value: 2, isPositive: false }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <EquityChart />
          </div>
          <div>
            <WinLossChart />
          </div>
        </div>

        {/* Recent Trades */}
        <RecentTradesTable />
      </div>
    </DashboardLayout>
  );
}
