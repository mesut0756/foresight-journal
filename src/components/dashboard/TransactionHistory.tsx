import { useTrades } from "@/hooks/useTrades";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Minus, History } from "lucide-react";

export function TransactionHistory() {
  const { trades } = useTrades();
  const { balance } = useAccountBalance();

  // Sort trades by date ascending to compute running balance
  const sortedTrades = [...trades]
    .filter((t) => t.result)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let runningBalance = balance ?? 0;
  const history = sortedTrades.map((trade) => {
    const pl = Number(trade.profit_loss) || 0;
    runningBalance += pl;
    return {
      id: trade.id,
      pair: trade.pair,
      result: trade.result,
      profitLoss: pl,
      balance: runningBalance,
      date: trade.created_at,
    };
  });

  // Show most recent first
  const reversed = [...history].reverse();

  if (reversed.length === 0) {
    return null;
  }

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
      </div>
      <div className="max-h-[320px] overflow-y-auto space-y-1 pr-1">
        {reversed.map((entry) => {
          const isWin = entry.result === "win";
          const isLoss = entry.result === "loss";
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-md ${
                    isWin
                      ? "bg-primary/10"
                      : isLoss
                      ? "bg-destructive/10"
                      : "bg-secondary"
                  }`}
                >
                  {isWin ? (
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                  ) : isLoss ? (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  ) : (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.pair}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(entry.date), "MMM d, yyyy · h:mm a")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    isWin
                      ? "text-primary"
                      : isLoss
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {entry.profitLoss >= 0 ? "+" : "-"}${Math.abs(entry.profitLoss).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Bal: ${entry.balance.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
