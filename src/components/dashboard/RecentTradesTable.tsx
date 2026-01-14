import { recentTrades } from "@/data/mockData";

export function RecentTradesTable() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Trades</h3>
        <p className="text-sm text-muted-foreground mt-1">Your latest trading activity</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Pair</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Type</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Pips</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">P/L</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Strategy</th>
            </tr>
          </thead>
          <tbody>
            {recentTrades.slice(0, 5).map((trade) => (
              <tr key={trade.id} className="trade-row border-b border-border/50 last:border-0">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
