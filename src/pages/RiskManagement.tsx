import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, AlertTriangle, Check, Calculator, Edit2, Save } from "lucide-react";
import { useRiskRules } from "@/hooks/useRiskRules";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { toast } from "sonner";

export default function RiskManagement() {
  const { riskRules, isLoading, updateRiskRules } = useRiskRules();
  const isUpdating = updateRiskRules.isPending;
  const { stats } = useDashboardStats();
  
  const [isEditing, setIsEditing] = useState(false);
  const [maxRiskPerTrade, setMaxRiskPerTrade] = useState("2.0");
  const [maxDailyLoss, setMaxDailyLoss] = useState("5.0");
  const [maxWeeklyLoss, setMaxWeeklyLoss] = useState("10.0");
  
  // Calculator state
  const [accountBalance, setAccountBalance] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("2.0");
  const [stopLossPips, setStopLossPips] = useState("50");
  const [calculatedRisk, setCalculatedRisk] = useState({ amount: 0, lotSize: 0 });

  // Update local state when risk rules load
  useEffect(() => {
    if (riskRules) {
      setMaxRiskPerTrade(riskRules.max_risk_per_trade.toString());
      setMaxDailyLoss(riskRules.max_daily_loss.toString());
      setMaxWeeklyLoss(riskRules.max_weekly_loss.toString());
    }
  }, [riskRules]);

  const handleSaveRules = async () => {
    try {
      await updateRiskRules.mutateAsync({
        max_risk_per_trade: parseFloat(maxRiskPerTrade),
        max_daily_loss: parseFloat(maxDailyLoss),
        max_weekly_loss: parseFloat(maxWeeklyLoss),
      });
      toast.success("Risk rules updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update risk rules");
    }
  };

  const calculatePositionSize = () => {
    const balance = parseFloat(accountBalance) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const slPips = parseFloat(stopLossPips) || 1;
    
    const riskAmount = (balance * risk) / 100;
    // Standard lot: 1 pip = $10, so lot size = risk amount / (pips * $10)
    const lotSize = riskAmount / (slPips * 10);
    
    setCalculatedRisk({
      amount: Math.round(riskAmount * 100) / 100,
      lotSize: Math.round(lotSize * 100) / 100,
    });
  };

  // Calculate on input change
  useEffect(() => {
    calculatePositionSize();
  }, [accountBalance, riskPercent, stopLossPips]);

  const riskRulesDisplay = riskRules ? [
    { id: 1, rule: "Maximum risk per trade", value: `${riskRules.max_risk_per_trade}%`, field: "max_risk_per_trade" },
    { id: 2, rule: "Maximum daily loss", value: `${riskRules.max_daily_loss}%`, field: "max_daily_loss" },
    { id: 3, rule: "Maximum weekly loss", value: `${riskRules.max_weekly_loss}%`, field: "max_weekly_loss" },
  ] : [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate current risk (mock calculation based on today's losses)
  const currentDailyRisk = stats ? Math.abs(Math.min(0, stats.totalProfit)) / 10000 * 100 : 0;
  const showWarning = riskRules && currentDailyRisk > (riskRules.max_daily_loss * 0.8);

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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Risk Rules</h3>
                  <p className="text-sm text-muted-foreground">Your active risk management rules</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => isEditing ? handleSaveRules() : setIsEditing(true)}
                disabled={isUpdating}
              >
                {isEditing ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <Edit2 className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Maximum risk per trade (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={maxRiskPerTrade}
                      onChange={(e) => setMaxRiskPerTrade(e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum daily loss (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={maxDailyLoss}
                      onChange={(e) => setMaxDailyLoss(e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum weekly loss (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={maxWeeklyLoss}
                      onChange={(e) => setMaxWeeklyLoss(e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                  <Button onClick={handleSaveRules} disabled={isUpdating} className="w-full">
                    {isUpdating ? "Saving..." : "Save Rules"}
                  </Button>
                </>
              ) : (
                riskRulesDisplay.map((rule, index) => (
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
                ))
              )}
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
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(e.target.value)}
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
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop Loss (pips)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  placeholder="50"
                  className="input-field font-mono"
                  value={stopLossPips}
                  onChange={(e) => setStopLossPips(e.target.value)}
                />
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Risk Amount</span>
                  <span className="font-mono font-medium text-foreground">${calculatedRisk.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Recommended Lot Size</span>
                  <span className="font-mono font-semibold text-primary">{calculatedRisk.lotSize.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        {showWarning && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Risk Warning</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your current daily losses are approaching your maximum daily loss limit of {riskRules?.max_daily_loss}%. 
                  Consider reducing position sizes or taking a break from trading.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
