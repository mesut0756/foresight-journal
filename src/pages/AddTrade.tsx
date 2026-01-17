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
import { useTradeScreenshots } from "@/hooks/useTradeScreenshots";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown, Upload, X, Camera, Image as ImageIcon } from "lucide-react";

interface PendingScreenshot {
  file: File;
  previewUrl: string;
  type: 'before' | 'after';
  description: string;
}

export default function AddTrade() {
  const navigate = useNavigate();
  const { createTrade } = useTrades();
  const { uploadScreenshot } = useTradeScreenshots();
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
  const [pendingScreenshots, setPendingScreenshots] = useState<PendingScreenshot[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Auto-calculate result based on P/L
  const getResult = (): "win" | "loss" | "breakeven" | undefined => {
    if (!profitLoss) return undefined;
    const pl = parseFloat(profitLoss);
    if (pl > 0) return "win";
    if (pl < 0) return "loss";
    return "breakeven";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPendingScreenshots(prev => [...prev, { file, previewUrl, type, description: '' }]);
    }
    e.target.value = '';
  };

  const removeScreenshot = (index: number) => {
    setPendingScreenshots(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const updateScreenshotDescription = (index: number, description: string) => {
    setPendingScreenshots(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], description };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pair || !entryPrice || !lotSize) {
      toast.error("Please fill in required fields (Pair, Entry Price, Lot Size)");
      return;
    }

    try {
      // Create the trade first
      const newTrade = await createTrade.mutateAsync({
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

      // Upload screenshots if any
      if (pendingScreenshots.length > 0 && newTrade?.id) {
        setIsUploading(true);
        for (const screenshot of pendingScreenshots) {
          await uploadScreenshot.mutateAsync({
            file: screenshot.file,
            tradeId: newTrade.id,
            screenshotType: screenshot.type,
            description: screenshot.description || undefined,
          });
        }
        setIsUploading(false);
      }
      
      toast.success("Trade added successfully!");
      navigate("/journal");
    } catch (error) {
      setIsUploading(false);
      toast.error("Failed to add trade");
    }
  };

  const beforeScreenshots = pendingScreenshots.filter(s => s.type === 'before');
  const afterScreenshots = pendingScreenshots.filter(s => s.type === 'after');

  const ScreenshotCard = ({ screenshot, index }: { screenshot: PendingScreenshot; index: number }) => {
    const actualIndex = pendingScreenshots.findIndex(s => s === screenshot);
    return (
      <div className="relative rounded-xl overflow-hidden border border-border group">
        <img 
          src={screenshot.previewUrl} 
          alt={`${screenshot.type} screenshot`}
          className="w-full h-48 object-cover"
        />
        <button
          type="button"
          onClick={() => removeScreenshot(actualIndex)}
          className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-2 bg-background/90">
          <Input
            placeholder="Add description..."
            className="text-sm h-8"
            value={screenshot.description}
            onChange={(e) => updateScreenshotDescription(actualIndex, e.target.value)}
          />
        </div>
      </div>
    );
  };

  const UploadButton = ({ type, label }: { type: 'before' | 'after'; label: string }) => (
    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors">
      <div className="flex flex-col items-center justify-center">
        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, type)}
      />
    </label>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
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

            {/* Screenshots Section */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground">Trade Screenshots</h3>
              
              {/* Before Trade Screenshots */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Camera className="w-5 h-5" />
                  Before Trade
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {beforeScreenshots.map((screenshot, index) => (
                    <ScreenshotCard key={index} screenshot={screenshot} index={index} />
                  ))}
                  <UploadButton type="before" label="Add Before Screenshot"/>
                </div>
              </div>

              {/* After Trade Screenshots */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <ImageIcon className="w-5 h-5" />
                  After Trade (Result)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {afterScreenshots.map((screenshot, index) => (
                    <ScreenshotCard key={index} screenshot={screenshot} index={index}/>
                  ))}
                  <UploadButton type="after" label="Add After Screenshot"
                  />
                </div>
              </div>
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
              disabled={isCreating || isUploading}
            >
              {isCreating || isUploading ? "Adding Trade..." : "Add Trade"}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
