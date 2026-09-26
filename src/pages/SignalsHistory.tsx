import { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { History, Trash2, TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";
import { useSignals, AiSignal } from "@/hooks/useSignals";

const DirBadge = ({ d }: { d: string }) => {
  const cfg =
    d === "buy"
      ? { cls: "bg-primary/15 text-primary", Icon: TrendingUp, label: "BUY" }
      : d === "sell"
      ? { cls: "bg-destructive/15 text-destructive", Icon: TrendingDown, label: "SELL" }
      : { cls: "bg-muted text-muted-foreground", Icon: Minus, label: "NEUTRAL" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <cfg.Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
};

const Level = ({ label, value }: { label: string; value: string | null }) => (
  <div>
    <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
    <p className="font-mono text-sm text-foreground truncate">{value || "-"}</p>
  </div>
);

export default function SignalsHistory() {
  const { signals, isLoading, remove } = useSignals();
  const [open, setOpen] = useState<AiSignal | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Signals History</h1>
            <p className="text-muted-foreground mt-1">Review every AI signal you've saved</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/signals"><Zap className="w-4 h-4 mr-2" /> New signal</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : signals.length === 0 ? (
          <EmptyState icon={History} title="No saved signals" description="Analyze a chart on the AI Signals page and save it to see it here." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {signals.map((s) => (
              <div key={s.id} className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
                <button onClick={() => setOpen(s)} className="text-left">
                  {s.screenshot_url ? (
                    <img src={s.screenshot_url} alt={`${s.pair ?? "Chart"} screenshot`} className="w-full h-40 object-cover bg-muted" />
                  ) : (
                    <div className="w-full h-40 bg-muted" />
                  )}
                </button>
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{s.pair ?? "Unknown pair"}</span>
                      <DirBadge d={s.direction} />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{format(new Date(s.created_at), "MMM d, HH:mm")}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Level label="Entry" value={s.entry} />
                    <Level label="SL" value={s.stop_loss} />
                    <Level label="TP" value={s.take_profit} />
                  </div>
                  <div className="flex gap-2 mt-auto pt-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpen(s)}>View analysis</Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Delete signal"
                      onClick={() => confirm("Delete this signal?") && remove.mutate(s)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {open.pair ?? "Signal"} <DirBadge d={open.direction} />
                </DialogTitle>
              </DialogHeader>
              {open.screenshot_url && <img src={open.screenshot_url} alt="Chart" className="w-full rounded-lg border border-border" />}
              <div className="grid grid-cols-4 gap-2">
                <Level label="Entry" value={open.entry} />
                <Level label="SL" value={open.stop_loss} />
                <Level label="TP" value={open.take_profit} />
                <Level label="R:R" value={open.risk_reward} />
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{open.analysis}</ReactMarkdown>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
