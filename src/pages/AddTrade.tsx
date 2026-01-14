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
import { forexPairs, strategyOptions } from "@/data/mockData";
import { useState } from "react";

export default function AddTrade() {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

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
          <form className="space-y-6">
            {/* Pair Selection */}
            <div className="space-y-2">
              <Label htmlFor="pair">Currency Pair</Label>
              <Select>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select pair" />
                </SelectTrigger>
                <SelectContent>
                  {forexPairs.map((pair) => (
                    <SelectItem key={pair} value={pair}>
                      {pair}
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
                <Label htmlFor="entry">Entry Price</Label>
                <Input
                  id="entry"
                  type="number"
                  step="0.00001"
                  placeholder="1.08500"
                  className="input-field font-mono"
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
                />
              </div>
            </div>

            {/* Lot Size and Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lotSize">Lot Size</Label>
                <Input
                  id="lotSize"
                  type="number"
                  step="0.01"
                  placeholder="0.10"
                  className="input-field font-mono"
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
                />
              </div>
            </div>

            {/* Strategy */}
            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy</Label>
              <Select>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {strategyOptions.map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy}
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
                className="input-field min-h-[120px] resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button type="button" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6">
              Add Trade
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
