import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { strategies } from "@/data/mockData";
import { Plus, TrendingUp, Target, DollarSign } from "lucide-react";

export default function Strategies() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Strategies</h1>
            <p className="text-muted-foreground mt-1">Analyze and optimize your trading strategies</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Strategy
          </Button>
        </div>

        {/* Strategy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {strategies.map((strategy, index) => (
            <div
              key={strategy.id}
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Strategy Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{strategy.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Trading Strategy</p>
                </div>
                <div className={`p-2 rounded-lg ${strategy.profit >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                  <TrendingUp className={`w-5 h-5 ${strategy.profit >= 0 ? "text-primary" : "text-destructive"}`} />
                </div>
              </div>

              {/* Strategy Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Total Trades</span>
                  </div>
                  <span className="font-mono font-medium text-foreground">{strategy.trades}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Win Rate</span>
                  </div>
                  <span className="font-mono font-medium text-primary">{strategy.winRate}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Profit/Loss</span>
                  </div>
                  <span className={`font-mono font-medium ${strategy.profit >= 0 ? "profit-text" : "loss-text"}`}>
                    {strategy.profit >= 0 ? "+" : ""}${strategy.profit.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Win Rate Bar */}
              <div className="mt-6">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${strategy.winRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
