import { useState, useMemo } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { forexPairs } from "@/data/mockData";
import { Edit2, Trash2, Search, Plus, CheckCircle2, Tag } from "lucide-react";
import { useTrades, Trade } from "@/hooks/useTrades";
import { useStrategies } from "@/hooks/useStrategies";
import { EmptyState } from "@/components/EmptyState";
import { TradeFormModal } from "@/components/TradeFormModal";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function Journal() {
  const { trades, isLoading, deleteTrade, updateTrade } = useTrades();
  const { strategies } = useStrategies();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [pairFilter, setPairFilter] = useState("all");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [deleteTradeId, setDeleteTradeId] = useState<string | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 15;

  // Get all unique tags from trades
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    trades.forEach(trade => {
      trade.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [trades]);

  // Get strategy name by ID
  const getStrategyName = (strategyId: string | null) => {
    if (!strategyId) return "-";
    const strategy = strategies.find(s => s.id === strategyId);
    return strategy?.name || "-";
  };

  // Filter trades
  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPair = pairFilter === "all" || trade.pair === pairFilter;
    const matchesStrategy = strategyFilter === "all" || trade.strategy_id === strategyFilter;
    const matchesResult = resultFilter === "all" || 
      (resultFilter === "win" && trade.result === "win") ||
      (resultFilter === "loss" && trade.result === "loss") ||
      (resultFilter === "open" && !trade.result);
    const matchesTag = tagFilter === "all" || trade.tags?.includes(tagFilter);
    
    return matchesSearch && matchesPair && matchesStrategy && matchesResult && matchesTag;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / tradesPerPage);
  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * tradesPerPage,
    currentPage * tradesPerPage
  );

  const handleDeleteTrade = async () => {
    if (deleteTradeId) {
      await deleteTrade.mutateAsync(deleteTradeId);
      setDeleteTradeId(null);
    }
  };

  const handleSaveTrade = async (tradeData: Partial<Trade>) => {
    await updateTrade.mutateAsync(tradeData as Trade & { id: string });
  };

  const getResultBadge = (result: string | null) => {
    if (!result) {
      return <Badge variant="outline" className="text-muted-foreground border-muted-foreground/50">Open</Badge>;
    }
    switch (result) {
      case "win":
        return <Badge className="text-green-600 bg-green-500/40 border-chart-2/50">Win</Badge>;
      case "loss":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/50">Loss</Badge>;
      case "breakeven":
        return <Badge variant="secondary">B/E</Badge>;
      default:
        return null;
    }
  };

  const tagColors = [
    "bg-primary/20 text-primary border-primary/50",
    "bg-chart-1/20 text-chart-1 border-chart-1/50",
    "bg-chart-2/20 text-chart-2 border-chart-2/50",
    "bg-chart-3/20 text-chart-3 border-chart-3/50",
    "bg-chart-4/20 text-chart-4 border-chart-4/50",
    "bg-chart-5/20 text-chart-5 border-chart-5/50",
  ];

  const getTagColor = (tag: string) => {
    const index = tag.charCodeAt(0) % tagColors.length;
    return tagColors[index];
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trade Journal</h1>
            <p className="text-muted-foreground mt-1">Review and manage all your trades</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/trade-replay">
              <Button variant="outline">
                <History className="w-4 h-4 mr-2" />
                Trade Replay
              </Button>
            </Link>
            <Link to="/add-trade">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Trade
              </Button>
            </Link>
          </div>

        </div>

        {trades.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No trades yet"
            description="Start recording your trades to track your performance"
            action={
              <Link to="/add-trade">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Trade
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            {/* Filters */}
            <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search trades, notes, tags..."
                    className="input-field pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Pair Filter */}
                <Select value={pairFilter} onValueChange={setPairFilter}>
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
                <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                  <SelectTrigger className="input-field w-[180px]">
                    <SelectValue placeholder="All Strategies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Strategies</SelectItem>
                    {strategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Result Filter */}
                <Select value={resultFilter} onValueChange={setResultFilter}>
                  <SelectTrigger className="input-field w-[140px]">
                    <SelectValue placeholder="Win/Loss" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="open">Open Trades</SelectItem>
                    <SelectItem value="win">Wins Only</SelectItem>
                    <SelectItem value="loss">Losses Only</SelectItem>
                  </SelectContent>
                </Select>

                {/* Tag Filter */}
                {allTags.length > 0 && (
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="input-field w-[140px]">
                      <Tag className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Tags" />
                    </SelectTrigger>
                    
                  </Select>
                )}
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
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Pips</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">P/L</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTrades.map((trade) => (
                      <tr key={trade.id} className="trade-row border-b border-border/50 last:border-0">
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(trade.created_at), "yyyy-MM-dd")}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono font-medium text-foreground">{trade.pair}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={trade.type === "buy" ? "buy-badge" : "sell-badge"}>
                            {trade.type.charAt(0).toUpperCase() + trade.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {getResultBadge(trade.result)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {trade.result ? (
                            <span className={`font-mono font-medium ${trade.result === "loss" ? "loss-text" : "profit-text"}`}>
                              {trade.result === "win" ? "+" : "-"}{Math.abs(trade.pips ?? 0)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {trade.result ? (
                            <span className={`font-mono font-medium ${(trade.profit_loss ?? 0) >= 0 ? "profit-text" : "loss-text"}`}>
                              {(trade.profit_loss ?? 0) >= 0 ? `+$${trade.profit_loss ?? 0}` : `-$${Math.abs(trade.profit_loss ?? 0)}`}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1">
                            {!trade.result && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-chart-2/10 hover:text-chart-2"
                                onClick={() => setEditingTrade(trade)}
                                title="Close Trade"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              onClick={() => setEditingTrade(trade)}
                              title="Edit Trade"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteTradeId(trade.id)}
                              title="Delete Trade"
                            >
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
                  Showing {(currentPage - 1) * tradesPerPage + 1}-{Math.min(currentPage * tradesPerPage, filteredTrades.length)} of {filteredTrades.length} trades
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit/Close Trade Modal */}
      <TradeFormModal
        open={!!editingTrade}
        onOpenChange={(open) => !open && setEditingTrade(null)}
        trade={editingTrade}
        onSave={handleSaveTrade}
        isLoading={updateTrade.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTradeId} onOpenChange={() => setDeleteTradeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrade} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
