import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { riskRules } from "@/data/mockData";
import { Shield, AlertTriangle, Check, Calculator } from "lucide-react";

export default function RiskManagement() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Risk Management</h1>
          <p className="text-muted-foreground mt-1">Control and monitor your trading risk</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Rules */}
          <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Risk Rules</h3>
                <p className="text-sm text-muted-foreground">Your active risk management rules</p>
              </div>
            </div>

            <div className="space-y-4">
              {riskRules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50 animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-primary/20">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{rule.rule}</span>
                  </div>
                  <span className="font-mono font-semibold text-primary">{rule.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Calculator */}
          <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Position Size Calculator</h3>
                <p className="text-sm text-muted-foreground">Calculate your optimal lot size</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="balance">Account Balance ($)</Label>
                <Input
                  id="balance"
                  type="number"
                  placeholder="10000"
                  className="input-field font-mono"
                  defaultValue="10000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="riskPercent">Risk per Trade (%)</Label>
                <Input
                  id="riskPercent"
                  type="number"
                  step="0.1"
                  placeholder="2.0"
                  className="input-field font-mono"
                  defaultValue="2.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop Loss (pips)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  placeholder="50"
                  className="input-field font-mono"
                  defaultValue="50"
                />
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Risk Amount</span>
                  <span className="font-mono font-medium text-foreground">$200.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Recommended Lot Size</span>
                  <span className="font-mono font-semibold text-primary">0.40</span>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">
                Calculate Position Size
              </Button>
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Risk Warning</h4>
              <p className="text-sm text-muted-foreground mt-1">
                You are currently risking <span className="text-destructive font-semibold">4.5%</span> of your account on open positions. 
                This exceeds your maximum daily loss limit of 5%. Consider reducing position sizes or closing some trades.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
