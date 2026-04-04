import { TrendingUp, Target, DollarSign, TrendingDown, BarChart3, Wallet } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { WinLossChart } from "@/components/dashboard/WinLossChart";
import { RecentTradesTable } from "@/components/dashboard/RecentTradesTable";
import { EmptyState } from "@/components/EmptyState";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useTrades } from "@/hooks/useTrades";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { stats, isLoading } = useDashboardStats();
  const { trades } = useTrades();
  const { balance } = useAccountBalance();
  const navigate = useNavigate();

  const currentBalance = balance + (stats?.totalProfit ?? 0);

  const hasTrades = trades.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your trading overview.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !hasTrades ? (
          <EmptyState
            icon={BarChart3}
            title="No trades yet"
            description="Start tracking your trades to see your performance metrics and analytics here."
            action={
              <Button onClick={() => navigate('/add-trade')} className="bg-primary hover:bg-primary/90">
                Add Your First Trade
              </Button>
            }
          />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              <StatCard
                title="Total Trades"
                value={stats?.totalTrades.toString() ?? "0"}
                icon={TrendingUp}
              />
              <StatCard
                title="Win Rate"
                value={`${stats?.winRate ?? 0}%`}
                icon={Target}
                variant="success"
              />
              <StatCard
                title="Total Profit"
                value={`$${stats?.totalProfit?.toLocaleString() ?? "0"}`}
                icon={DollarSign}
                variant={stats?.totalProfit && stats.totalProfit >= 0 ? "success" : "destructive"}
              />
              <StatCard
                title="Max Drawdown"
                value={`$${stats?.maxDrawdown?.toLocaleString() ?? "0"}`}
                icon={TrendingDown}
                variant="destructive"
              />
              <StatCard
                title="Account Balance"
                value={`$${currentBalance.toLocaleString()}`}
                icon={Wallet}
                variant={currentBalance >= balance ? "success" : "destructive"}
              />
            </div>

            {/* Charts Row - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-1 gap-1">
             
              <div>
                <WinLossChart />
              </div>
            </div>

            {/* Recent Trades */}
            <RecentTradesTable />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
