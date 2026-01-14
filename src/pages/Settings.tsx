import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { forexPairs } from "@/data/mockData";
import { Settings as SettingsIcon, Percent, DollarSign, Sun, Moon, Bell } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your trading journal preferences</p>
        </div>

        {/* Trading Preferences */}
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Trading Preferences</h3>
              <p className="text-sm text-muted-foreground">Configure your default trading settings</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="defaultRisk" className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-muted-foreground" />
                Default Risk per Trade
              </Label>
              <Input
                id="defaultRisk"
                type="number"
                step="0.1"
                placeholder="2.0"
                className="input-field font-mono"
                defaultValue="2.0"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                Base Currency
              </Label>
              <Select defaultValue="USD">
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                Preferred Pairs
              </Label>
              <div className="flex flex-wrap gap-2">
                {forexPairs.slice(0, 8).map((pair) => (
                  <Button
                    key={pair}
                    variant="outline"
                    size="sm"
                    className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  >
                    {pair}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Click to toggle preferred pairs</p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
              <p className="text-sm text-muted-foreground">Customize the look and feel</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Notifications</p>
                  <p className="text-sm text-muted-foreground">Enable trade alerts</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button className="w-full bg-primary hover:bg-primary/90 py-6 font-semibold">
          Save Changes
        </Button>
      </div>
    </DashboardLayout>
  );
}
