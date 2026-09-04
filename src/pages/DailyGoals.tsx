import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Target, Brain, AlertTriangle, CalendarDays } from "lucide-react";
import { useDailyGoals } from "@/hooks/useDailyGoals";
import { useTrades } from "@/hooks/useTrades";
import { format, parseISO, isSameDay } from "date-fns";

const formatMoney = (v: number) =>
  `${v < 0 ? "-" : ""}$${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function DailyGoals() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { goal, history, isLoading, saveGoal } = useDailyGoals(date);
  const { trades } = useTrades();

  const [maxTrades, setMaxTrades] = useState("3");
  const [maxLoss, setMaxLoss] = useState("100");
  const [mindset, setMindset] = useState("");
  const [mistakes, setMistakes] = useState("");

  useEffect(() => {
    setMaxTrades(goal ? String(goal.max_trades) : "3");
    setMaxLoss(goal ? String(goal.max_loss) : "100");
    setMindset(goal?.mindset ?? "");
    setMistakes(goal?.mistakes ?? "");
  }, [goal, date]);

  const dayStats = useMemo(() => {
    const target = parseISO(date);
    const dayTrades = trades.filter((t) => isSameDay(new Date(t.created_at), target));
    const pnl = dayTrades.reduce((sum, t) => sum + (Number(t.profit_loss) || 0), 0);
    const loss = pnl < 0 ? Math.abs(pnl) : 0;
    return { count: dayTrades.length, pnl, loss };
  }, [trades, date]);

  const tradeLimit = parseFloat(maxTrades) || 0;
  const lossLimit = parseFloat(maxLoss) || 0;
  const tradePct = tradeLimit > 0 ? Math.min(100, (dayStats.count / tradeLimit) * 100) : 0;
  const lossPct = lossLimit > 0 ? Math.min(100, (dayStats.loss / lossLimit) * 100) : 0;

  const handleSave = () => {
    saveGoal.mutate({
      goal_date: date,
      max_trades: parseInt(maxTrades) || 0,
      max_loss: parseFloat(maxLoss) || 0,
      mindset: mindset || null,
      mistakes: mistakes || null,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Daily Goals</h1>
            <p className="text-muted-foreground mt-1">Set your limits and journal your mindset each day</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="goal-date">Date</Label>
            <Input
              id="goal-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field font-mono w-full sm:w-48"
            />
          </div>
        </div>

        {/* Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Trades taken</span>
              <span className="font-mono font-semibold text-foreground">
                {dayStats.count} / {tradeLimit || "-"}
              </span>
            </div>
            <Progress value={tradePct} className="h-2" />
            {tradeLimit > 0 && dayStats.count >= tradeLimit && (
              <p className="text-xs text-destructive mt-3">Daily trade limit reached — stop trading today.</p>
            )}
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Loss used</span>
              <span className={`font-mono font-semibold ${dayStats.pnl < 0 ? "text-destructive" : "text-primary"}`}>
                {formatMoney(dayStats.pnl)} / {formatMoney(lossLimit)}
              </span>
            </div>
            <Progress value={lossPct} className="h-2" />
            {lossLimit > 0 && lossPct >= 80 && (
              <p className="text-xs text-destructive mt-3">
                You've used {Math.round(lossPct)}% of your max daily loss.
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Plan for {format(parseISO(date), "MMM d, yyyy")}</h3>
              <p className="text-sm text-muted-foreground">Limits, mindset and mistakes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="max-trades">Max trades today</Label>
              <Input
                id="max-trades"
                type="number"
                min="0"
                value={maxTrades}
                onChange={(e) => setMaxTrades(e.target.value)}
                className="input-field font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-loss">Max loss today ($)</Label>
              <Input
                id="max-loss"
                type="number"
                step="0.01"
                min="0"
                value={maxLoss}
                onChange={(e) => setMaxLoss(e.target.value)}
                className="input-field font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mindset" className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" /> Mindset
            </Label>
            <Textarea
              id="mindset"
              rows={4}
              placeholder="How are you feeling? Focused, rushed, revenge-trading?"
              value={mindset}
              onChange={(e) => setMindset(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mistakes" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> Mistakes
            </Label>
            <Textarea
              id="mistakes"
              rows={4}
              placeholder="What went wrong today and what will you fix tomorrow?"
              value={mistakes}
              onChange={(e) => setMistakes(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} disabled={saveGoal.isPending || isLoading} className="w-full sm:w-auto">
            {saveGoal.isPending ? "Saving..." : "Save Daily Plan"}
          </Button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Recent entries</h3>
            </div>
            <div className="space-y-3">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setDate(h.goal_date)}
                  className="w-full text-left p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {format(parseISO(h.goal_date), "EEE, MMM d yyyy")}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {h.max_trades} trades · {formatMoney(Number(h.max_loss))} max loss
                    </span>
                  </div>
                  {h.mindset && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{h.mindset}</p>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
