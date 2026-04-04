import { useTrades } from "@/hooks/useTrades";
import { startOfWeek, endOfWeek, subWeeks, isWithinInterval, getDay } from "date-fns";
import { TrendingUp, TrendingDown, Trophy, CalendarDays } from "lucide-react";

export function WeeklyRecap() {
  const { trades } = useTrades();

  const today = new Date();
  const dayOfWeek = getDay(today); // 0=Sun, 6=Sat

  // Only show on Saturday (6) or Sunday (0)
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    return null;
  }

  const closedTrades = trades.filter((t) => t.result);

  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

  const thisWeekTrades = closedTrades.filter((t) =>
    isWithinInterval(new Date(t.created_at), { start: thisWeekStart, end: thisWeekEnd })
  );
  const lastWeekTrades = closedTrades.filter((t) =>
    isWithinInterval(new Date(t.created_at), { start: lastWeekStart, end: lastWeekEnd })
  );

  if (thisWeekTrades.length === 0) {
    return null;
  }

  const thisWeekProfit = thisWeekTrades.reduce((s, t) => s + (Number(t.profit_loss) || 0), 0);
  const lastWeekProfit = lastWeekTrades.reduce((s, t) => s + (Number(t.profit_loss) || 0), 0);
  const thisWeekWins = thisWeekTrades.filter((t) => t.result === "win").length;
  const thisWeekWinRate = Math.round((thisWeekWins / thisWeekTrades.length) * 100);

  // Best pair this week
  const pairMap = new Map<string, number>();
  thisWeekTrades.forEach((t) => {
    const pl = Number(t.profit_loss) || 0;
    pairMap.set(t.pair, (pairMap.get(t.pair) || 0) + pl);
  });
  let bestPair = "";
  let bestPairPl = -Infinity;
  pairMap.forEach((pl, pair) => {
    if (pl > bestPairPl) {
      bestPairPl = pl;
      bestPair = pair;
    }
  });

  // Comparison
  let comparisonText = "";
  if (lastWeekTrades.length > 0 && lastWeekProfit !== 0) {
    const diff = thisWeekProfit - lastWeekProfit;
    const pctChange = Math.round((Math.abs(diff) / Math.abs(lastWeekProfit)) * 100);
    comparisonText =
      diff >= 0
        ? `This week is ${pctChange}% better than last week`
        : `This week is ${pctChange}% worse than last week`;
  } else if (lastWeekTrades.length === 0) {
    comparisonText = "No trades last week to compare";
  }

  const isProfit = thisWeekProfit >= 0;

  return (
    <div className="stat-card animate-fade-in border-l-4 border-l-primary">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Weekly Recap</h3>
      </div>
      <div className="space-y-3">
        {/* Profit summary */}
        <div className="flex items-center gap-2">
          {isProfit ? (
            <TrendingUp className="w-4 h-4 text-primary" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive" />
          )}
          <span className="text-sm text-foreground">
            You {isProfit ? "made" : "lost"}{" "}
            <span className={`font-bold ${isProfit ? "text-primary" : "text-destructive"}`}>
              ${Math.abs(thisWeekProfit).toLocaleString()}
            </span>{" "}
            this week across {thisWeekTrades.length} trade{thisWeekTrades.length !== 1 ? "s" : ""} ({thisWeekWinRate}% win rate)
          </span>
        </div>

        {/* Comparison */}
        {comparisonText && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">📊 {comparisonText}</span>
          </div>
        )}

        {/* Best pair */}
        {bestPair && (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent-foreground" />
            <span className="text-sm text-foreground">
              Best pair:{" "}
              <span className="font-semibold">{bestPair}</span>{" "}
              <span className={bestPairPl >= 0 ? "text-primary" : "text-destructive"}>
                ({bestPairPl >= 0 ? "+" : "-"}${Math.abs(bestPairPl).toLocaleString()})
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
