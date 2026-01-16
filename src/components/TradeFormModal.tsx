import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { forexPairs } from "@/data/mockData";
import { Trade } from "@/hooks/useTrades";
import { useStrategies } from "@/hooks/useStrategies";
import { TagInput } from "@/components/TagInput";
import { TradeScreenshots } from "@/components/TradeScreenshots";

// Common tag suggestions
const TAG_SUGGESTIONS = [
  "breakout", "reversal", "trend", "range", "news", "scalp", "swing",
  "asian session", "london session", "ny session", "high impact", "fomo",
  "revenge trade", "patience", "confluence", "support", "resistance"
];

interface TradeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: Trade | null;
  onSave: (trade: Partial<Trade>) => Promise<void>;
  isLoading?: boolean;
}

export function TradeFormModal({
  open,
  onOpenChange,
  trade,
  onSave,
  isLoading = false,
}: TradeFormModalProps) {
  const { strategies } = useStrategies();
  const [activeTab, setActiveTab] = useState<"details" | "close" | "screenshots">("details");

  // Edit fields
  const [pair, setPair] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [strategyId, setStrategyId] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Close trade fields
  const [pips, setPips] = useState("");
  const [profitLoss, setProfitLoss] = useState("");
  const [result, setResult] = useState<"win" | "loss" | "breakeven" | "">("");

  // Populate form when trade changes
  useEffect(() => {
    if (trade) {
      setPair(trade.pair);
      setTradeType(trade.type);
      setEntryPrice(trade.entry_price.toString());
      setStopLoss(trade.stop_loss?.toString() || "");
      setTakeProfit(trade.take_profit?.toString() || "");
      setLotSize(trade.lot_size.toString());
      setRiskPercent(trade.risk_percent?.toString() || "");
      setStrategyId(trade.strategy_id || "");
      setNotes(trade.notes || "");
      setTags(trade.tags || []);
      setPips(trade.pips?.toString() || "");
      setProfitLoss(trade.profit_loss?.toString() || "");
      setResult(trade.result || "");
      
      // If trade already has result, default to close tab
      setActiveTab(trade.result ? "close" : "details");
    }
  }, [trade]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setActiveTab("details");
    }
  }, [open]);

  const handleSaveDetails = async () => {
    if (!trade) return;
    
    await onSave({
      id: trade.id,
      pair,
      type: tradeType,
      entry_price: parseFloat(entryPrice),
      stop_loss: stopLoss ? parseFloat(stopLoss) : null,
      take_profit: takeProfit ? parseFloat(takeProfit) : null,
      lot_size: parseFloat(lotSize),
      risk_percent: riskPercent ? parseFloat(riskPercent) : null,
      strategy_id: strategyId || null,
      notes: notes || null,
      tags: tags.length > 0 ? tags : null,
    });
    onOpenChange(false);
  };

  const handleCloseTrade = async () => {
    if (!trade || !profitLoss) return;

    const pl = parseFloat(profitLoss);
    const calculatedResult = pl > 0 ? "win" : pl < 0 ? "loss" : "breakeven";

    await onSave({
      id: trade.id,
      pips: pips ? parseFloat(pips) : null,
      profit_loss: pl,
      result: calculatedResult,
    });
    onOpenChange(false);
  };

  // Auto-calculate result based on P/L
  useEffect(() => {
    if (profitLoss) {
      const pl = parseFloat(profitLoss);
      if (pl > 0) setResult("win");
      else if (pl < 0) setResult("loss");
      else setResult("breakeven");
    }
  }, [profitLoss]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {trade?.result ? "Edit Closed Trade" : "Edit Trade"}
          </DialogTitle>
          <DialogDescription>
            {trade?.pair} - {trade?.type.toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "details" | "close" | "screenshots")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="close">Close Trade</TabsTrigger>
            <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
          </TabsList>

          {/* Trade Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Pair Selection */}
            <div className="space-y-2">
              <Label htmlFor="edit-pair">Currency Pair</Label>
              <Select value={pair} onValueChange={setPair}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select pair" />
                </SelectTrigger>
                <SelectContent>
                  {forexPairs.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Buy/Sell Toggle */}
            <div className="space-y-2">
              <Label>Trade Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={tradeType === "buy" ? "default" : "outline"}
                  className={`flex-1 ${tradeType === "buy" ? "bg-primary hover:bg-primary/90" : ""}`}
                  onClick={() => setTradeType("buy")}
                >
                  Buy
                </Button>
                <Button
                  type="button"
                  variant={tradeType === "sell" ? "default" : "outline"}
                  className={`flex-1 ${tradeType === "sell" ? "bg-destructive hover:bg-destructive/90" : ""}`}
                  onClick={() => setTradeType("sell")}
                >
                  Sell
                </Button>
              </div>
            </div>

            {/* Price Fields */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-entry">Entry Price</Label>
                <Input
                  id="edit-entry"
                  type="number"
                  step="0.00001"
                  className="input-field font-mono"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sl">Stop Loss</Label>
                <Input
                  id="edit-sl"
                  type="number"
                  step="0.00001"
                  className="input-field font-mono"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tp">Take Profit</Label>
                <Input
                  id="edit-tp"
                  type="number"
                  step="0.00001"
                  className="input-field font-mono"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                />
              </div>
            </div>

            {/* Lot Size and Risk */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-lotSize">Lot Size</Label>
                <Input
                  id="edit-lotSize"
                  type="number"
                  step="0.01"
                  className="input-field font-mono"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-risk">Risk %</Label>
                <Input
                  id="edit-risk"
                  type="number"
                  step="0.1"
                  className="input-field font-mono"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                />
              </div>
            </div>

            {/* Strategy */}
            <div className="space-y-2">
              <Label htmlFor="edit-strategy">Strategy</Label>
              <Select value={strategyId || "none"} onValueChange={(v) => setStrategyId(v === "none" ? "" : v)}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Strategy</SelectItem>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput 
                tags={tags} 
                onChange={setTags} 
                placeholder="Add tags (press Enter)"
                suggestions={TAG_SUGGESTIONS}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                className="input-field min-h-[80px] resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSaveDetails}
              disabled={isLoading || !pair || !entryPrice || !lotSize}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </TabsContent>

          {/* Close Trade Tab */}
          <TabsContent value="close" className="space-y-4 mt-4">
            <div className="p-4 bg-secondary/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Trade Summary</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium text-foreground">{trade?.pair}</span>
                <span className={trade?.type === "buy" ? "buy-badge" : "sell-badge"}>
                  {trade?.type.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>Entry: {trade?.entry_price}</span>
                <span>Lot: {trade?.lot_size}</span>
              </div>
            </div>

            {/* Auto-calculated Result Display */}
            {profitLoss && (
              <div className="p-3 rounded-lg border border-border bg-secondary/20">
                <p className="text-sm text-muted-foreground mb-1">Result (auto-calculated)</p>
                <span className={`text-lg font-semibold ${
                  result === "win" ? "text-primary" : 
                  result === "loss" ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {result === "win" ? "Win" : result === "loss" ? "Loss" : "Breakeven"}
                </span>
              </div>
            )}

            {/* Pips and P/L */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="close-pips">Pips</Label>
                <Input
                  id="close-pips"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 25 or -15"
                  className="input-field font-mono"
                  value={pips}
                  onChange={(e) => setPips(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="close-pl">Profit/Loss ($)</Label>
                <Input
                  id="close-pl"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 150 or -75"
                  className="input-field font-mono"
                  value={profitLoss}
                  onChange={(e) => setProfitLoss(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleCloseTrade}
              disabled={isLoading || !profitLoss}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Saving..." : trade?.result ? "Update Result" : "Close Trade"}
            </Button>
          </TabsContent>

          {/* Screenshots Tab */}
          <TabsContent value="screenshots" className="mt-4">
            {trade && <TradeScreenshots tradeId={trade.id} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
