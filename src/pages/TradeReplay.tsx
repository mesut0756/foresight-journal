import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { ChevronLeft, ChevronRight, History, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

const formatMoney = (v: number) =>
  `${v < 0 ? "-" : ""}$${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function TradeReplay() {
  const { trades, isLoading } = useTrades();
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const dayMap = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number }>();
    trades.forEach((t) => {
      const key = format(new Date(t.created_at), "yyyy-MM-dd");
      const entry = map.get(key) ?? { pnl: 0, count: 0 };
      entry.pnl += Number(t.profit_loss) || 0;
      entry.count += 1;
      map.set(key, entry);
    });
    return map;
  }, [trades]);

  const maxAbs = useMemo(() => {
    let max = 0;
    dayMap.forEach((v) => {
      max = Math.max(max, Math.abs(v.pnl));
    });
    return max || 1;
  }, [dayMap]);

  const monthTotal = useMemo(() => {
    let total = 0;
    dayMap.forEach((v, key) => {
      if (isSameMonth(new Date(key), month)) total += v.pnl;
    });
    return total;
  }, [dayMap, month]);

  const selectedTrades = useMemo(() => {
    if (!selectedDay) return [];
    return trades
      .filter((t) => isSameDay(new Date(t.created_at), selectedDay))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [trades, selectedDay]);

  const heatStyle = (pnl: number) => {
    const intensity = Math.min(1, Math.abs(pnl) / maxAbs);
    const alpha = 0.15 + intensity * 0.55;
    if (pnl === 0) return {};
    return {
      backgroundColor: pnl > 0
        ? `hsl(var(--primary) / ${alpha})`
        : `hsl(var(--destructive) / ${alpha})`,
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trade Replay</h1>
          <p className="text-muted-foreground mt-1">Relive your trading days with a P&amp;L heatmap and timeline</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trades.length === 0 ? (
          <EmptyState
            icon={History}
            title="No trades to replay"
            description="Log a few trades and they will show up here on the calendar."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar heatmap */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-5">
                <Button variant="ghost" size="icon" onClick={() => setMonth(subMonths(month, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">{format(month, "MMMM yyyy")}</h3>
                  <span
                    className={`font-mono text-sm ${monthTotal >= 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {formatMoney(monthTotal)}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="text-center text-[11px] font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const data = dayMap.get(key);
                  const inMonth = isSameMonth(day, month);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(day)}
                      style={data ? heatStyle(data.pnl) : undefined}
                      className={`aspect-square rounded-md border text-left p-1.5 transition-colors ${
                        isSelected ? "border-primary" : "border-border/50"
                      } ${inMonth ? "" : "opacity-40"} hover:border-primary/60`}
                    >
                      <div className="text-[11px] font-medium text-foreground">{format(day, "d")}</div>
                      {data && (
                        <div
                          className={`font-mono text-[9px] leading-tight ${
                            data.pnl >= 0 ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {formatMoney(data.pnl)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 mt-5 text-xs text-muted-foreground">
                <span>Loss</span>
                <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-destructive via-muted to-primary" />
                <span>Profit</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-1">
                {selectedDay ? format(selectedDay, "EEEE, MMM d yyyy") : "Select a day"}
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                {selectedTrades.length} trade{selectedTrades.length === 1 ? "" : "s"}
              </p>

              {selectedTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No trades on this day.</p>
              ) : (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-1 before:bottom-1 before:w-px before:bg-border">
                  {selectedTrades.map((t) => {
                    const pnl = Number(t.profit_loss) || 0;
                    const isWin = t.result === "win" || (!t.result && pnl > 0);
                    return (
                      <div key={t.id} className="relative">
                        <span
                          className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-card ${
                            pnl >= 0 ? "bg-primary" : "bg-destructive"
                          }`}
                        />
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              {t.type === "buy" ? (
                                <ArrowUpRight className="w-4 h-4 text-primary" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-destructive" />
                              )}
                              <span className="font-medium text-foreground">{t.pair}</span>
                              <span className="text-xs text-muted-foreground uppercase">{t.type}</span>
                            </div>
                            <span
                              className={`font-mono font-semibold ${pnl >= 0 ? "text-primary" : "text-destructive"}`}
                            >
                              {formatMoney(pnl)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground font-mono">
                            <span>{format(new Date(t.created_at), "HH:mm")}</span>
                            <span>Entry {t.entry_price}</span>
                            {t.pips !== null && (
                              <span className={isWin ? "text-primary" : "text-destructive"}>
                                {pnl >= 0 ? "+" : "-"}
                                {Math.abs(Number(t.pips))} pips
                              </span>
                            )}
                            <span>{t.lot_size} lots</span>
                          </div>
                          {t.notes && <p className="text-sm text-muted-foreground mt-2">{t.notes}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
