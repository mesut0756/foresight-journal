import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allTrades, forexPairs, strategyOptions } from "@/data/mockData";
import { Edit2, Trash2, Search } from "lucide-react";

export default function Journal() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trade Journal</h1>
          <p className="text-muted-foreground mt-1">Review and manage all your trades</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search trades..."
                className="input-field pl-10"
              />
            </div>

            {/* Pair Filter */}
            <Select>
              <SelectTrigger className="input-field w-[150px]">
                <SelectValue placeholder="All Pairs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pairs</SelectItem>
                {forexPairs.map((pair) => (
                  <SelectItem key={pair} value={pair}>
                    {pair}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Strategy Filter */}
            <Select>
              <SelectTrigger className="input-field w-[180px]">
                <SelectValue placeholder="All Strategies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strategies</SelectItem>
                {strategyOptions.map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {strategy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Result Filter */}
            <Select>
              <SelectTrigger className="input-field w-[140px]">
                <SelectValue placeholder="Win/Loss" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="win">Wins Only</SelectItem>
                <SelectItem value="loss">Losses Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Input
              type="date"
              className="input-field w-[180px]"
            />
          </div>
        </div>

        {/* Trades Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Pair</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Type</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Pips</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">P/L</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Strategy</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allTrades.map((trade) => (
                  <tr key={trade.id} className="trade-row border-b border-border/50 last:border-0">
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">{trade.date}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-medium text-foreground">{trade.pair}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={trade.type === "Buy" ? "buy-badge" : "sell-badge"}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-mono font-medium ${trade.pips >= 0 ? "profit-text" : "loss-text"}`}>
                        {trade.pips >= 0 ? "+" : ""}{trade.pips}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-mono font-medium ${trade.profit >= 0 ? "profit-text" : "loss-text"}`}>
                        {trade.profit >= 0 ? "+" : ""}${trade.profit}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">{trade.strategy}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing 1-15 of {allTrades.length} trades
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
