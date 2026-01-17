import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { forexPairs } from "@/data/mockData";
import { useState } from "react";
import { useTrades } from "@/hooks/useTrades";
import { useStrategies } from "@/hooks/useStrategies";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

export default function AddTrade() {
  const navigate = useNavigate();
  const { createTrade } = useTrades();
  const isCreating = createTrade.isPending;
  const { strategies } = useStrategies();
  
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [pair, setPair] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [strategyId, setStrategyId] = useState("");
  const [notes, setNotes] = useState("");
  const [pips, setPips] = useState("");
  const [profitLoss, setProfitLoss] = useState("");
  const [showClosedTrade, setShowClosedTrade] = useState(false);

  // Auto-calculate result based on P/L
  const getResult = (): "win" | "loss" | "breakeven" | undefined => {
    if (!profitLoss) return undefined;
    const pl = parseFloat(profitLoss);
    if (pl > 0) return "win";
    if (pl < 0) return "loss";
    return "breakeven";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pair || !entryPrice || !lotSize) {
      toast.error("Please fill in required fields (Pair, Entry Price, Lot Size)");
      return;
    }

    try {
      await createTrade.mutateAsync({
        pair,
        type: tradeType,
        entry_price: parseFloat(entryPrice),
        stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
        take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
        lot_size: parseFloat(lotSize),
        risk_percent: riskPercent ? parseFloat(riskPercent) : undefined,
        strategy_id: strategyId || undefined,
        notes: notes || undefined,
        tags: undefined,
        pips: pips ? parseFloat(pips) : undefined,
        profit_loss: profitLoss ? parseFloat(profitLoss) : undefined,
        result: getResult(),
      });
      
      toast.success("Trade added successfully!");
      navigate("/journal");
    } catch (error) {
      toast.error("Failed to add trade");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Trade</h1>
          <p className="text-muted-foreground mt-1">Record a new trading position</p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Pair Selection */}
            <div className="space-y-2">
              <Label htmlFor="pair">Currency Pair *</Label>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry">Entry Price *</Label>
                <Input
                  id="entry"
                  type="number"
                  step="0.00001"
                  placeholder="1.08500"
                  className="input-field font-mono"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sl">Stop Loss</Label>
                <Input
                  id="sl"
                  type="number"
                  step="0.00001"
                  placeholder="1.08200"
                  className="input-field font-mono"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tp">Take Profit</Label>
                <Input
                  id="tp"
                  type="number"
                  step="0.00001"
                  placeholder="1.09000"
                  className="input-field font-mono"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                />
              </div>
            </div>

            {/* Lot Size and Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lotSize">Lot Size *</Label>
                <Input
                  id="lotSize"
                  type="number"
                  step="0.01"
                  placeholder="0.10"
                  className="input-field font-mono"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk">Risk %</Label>
                <Input
                  id="risk"
                  type="number"
                  step="0.1"
                  placeholder="2.0"
                  className="input-field font-mono"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                />
              </div>
            </div>

            {/* Strategy */}
            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy</Label>
              <Select value={strategyId} onValueChange={setStrategyId}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add your trade notes, analysis, or observations..."
                className="input-field min-h-[100px] resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Closed Trade Section (Collapsible) */}
            <Collapsible open={showClosedTrade} onOpenChange={setShowClosedTrade}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/30"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    Add as closed trade (optional)
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showClosedTrade ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4 p-4 border border-border rounded-lg bg-secondary/10">
                {/* Pips and P/L */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pips">Pips</Label>
                    <Input
                      id="pips"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 25 or -15"
                      className="input-field font-mono"
                      value={pips}
                      onChange={(e) => setPips(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pl">Profit/Loss ($)</Label>
                    <Input
                      id="pl"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 150 or -75"
                      className="input-field font-mono"
                      value={profitLoss}
                      onChange={(e) => setProfitLoss(e.target.value)}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              disabled={isCreating}
            >
              {isCreating ? "Adding Trade..." : "Add Trade"}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
