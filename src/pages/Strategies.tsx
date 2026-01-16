import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, TrendingUp, Target, DollarSign, Trash2 } from "lucide-react";
import { useStrategies } from "@/hooks/useStrategies";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

export default function Strategies() {
  const { strategiesWithStats, isLoading, createStrategy, deleteStrategy } = useStrategies();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteStrategyId, setDeleteStrategyId] = useState<string | null>(null);
  const [newStrategyName, setNewStrategyName] = useState("");
  const [newStrategyDescription, setNewStrategyDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateStrategy = async () => {
    if (!newStrategyName.trim()) {
      toast.error("Please enter a strategy name");
      return;
    }

    setIsCreating(true);
    try {
      await createStrategy.mutateAsync({
        name: newStrategyName.trim(),
        description: newStrategyDescription.trim() || undefined,
      });
      toast.success("Strategy created successfully!");
      setIsDialogOpen(false);
      setNewStrategyName("");
      setNewStrategyDescription("");
    } catch (error) {
      toast.error("Failed to create strategy");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStrategy = async () => {
    if (deleteStrategyId) {
      try {
        await deleteStrategy.mutateAsync(deleteStrategyId);
        toast.success("Strategy deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete strategy");
      }
      setDeleteStrategyId(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Strategies</h1>
            <p className="text-muted-foreground mt-1">Analyze and optimize your trading strategies</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Strategy
          </Button>
        </div>

        {strategiesWithStats.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No strategies yet"
            description="Create strategies to categorize and analyze your trades"
            action={
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Strategy
              </Button>
            }
          />
        ) : (
          /* Strategy Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {strategiesWithStats.map((strategy, index) => (
              <div
                key={strategy.id}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-all duration-300 animate-fade-in relative group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                  onClick={() => setDeleteStrategyId(strategy.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                {/* Strategy Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{strategy.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {strategy.description || "Trading Strategy"}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${strategy.profit >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                    <TrendingUp className={`w-5 h-5 ${strategy.profit >= 0 ? "text-primary" : "text-destructive"}`} />
                  </div>
                </div>

                {/* Strategy Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Total Trades</span>
                    </div>
                    <span className="font-mono font-medium text-foreground">{strategy.trades}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Win Rate</span>
                    </div>
                    <span className="font-mono font-medium text-primary">{strategy.winRate}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Profit/Loss</span>
                    </div>
                    <span className={`font-mono font-medium ${strategy.profit >= 0 ? "profit-text" : "loss-text"}`}>
                      {strategy.profit >= 0 ? "+" : ""}${strategy.profit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Win Rate Bar */}
                <div className="mt-6">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${strategy.winRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Strategy Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Strategy</DialogTitle>
            <DialogDescription>
              Add a new trading strategy to categorize your trades.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strategyName">Strategy Name *</Label>
              <Input
                id="strategyName"
                placeholder="e.g., Breakout, Trend Following"
                value={newStrategyName}
                onChange={(e) => setNewStrategyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="strategyDescription">Description</Label>
              <Textarea
                id="strategyDescription"
                placeholder="Describe your strategy..."
                value={newStrategyDescription}
                onChange={(e) => setNewStrategyDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStrategy} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Strategy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteStrategyId} onOpenChange={() => setDeleteStrategyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Strategy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this strategy? Trades linked to this strategy will no longer have a strategy assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStrategy} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
