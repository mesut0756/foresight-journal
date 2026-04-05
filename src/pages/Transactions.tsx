import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";

export default function Transactions() {
  const { transactions, isLoading, addTransaction, deleteTransaction } = useTransactions();
  const { balance, updateBalance } = useAccountBalance();
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    await addTransaction.mutateAsync({ type, amount: numAmount, note });

    // Update account balance
    const newBalance = type === "deposit"
      ? balance + numAmount
      : balance - numAmount;
    await updateBalance.mutateAsync(newBalance);

    setAmount("");
    setNote("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deposits & Withdrawals</h1>
          <p className="text-muted-foreground">Manage your account funding</p>
        </div>

        {/* Current Balance */}
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold text-foreground">${balance.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Add Transaction Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" /> New Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("deposit")}
                  className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                    type === "deposit"
                      ? "bg-green-500/15 text-green-600 dark:text-green-400 border-2 border-green-500/30"
                      : "bg-muted text-muted-foreground border-2 border-transparent"
                  }`}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setType("withdrawal")}
                  className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                    type === "withdrawal"
                      ? "bg-red-500/15 text-red-600 dark:text-red-400 border-2 border-red-500/30"
                      : "bg-muted text-muted-foreground border-2 border-transparent"
                  }`}
                >
                  Withdrawal
                </button>
              </div>

              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  placeholder="e.g. Monthly funding"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={addTransaction.isPending || !amount}
              >
                {addTransaction.isPending ? "Saving..." : `Record ${type === "deposit" ? "Deposit" : "Withdrawal"}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No transactions yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      tx.type === "deposit"
                        ? "bg-green-500/15 text-green-600 dark:text-green-400"
                        : "bg-red-500/15 text-red-600 dark:text-red-400"
                    }`}>
                      {tx.type === "deposit" ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.note || format(new Date(tx.created_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        tx.type === "deposit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}>
                        {tx.type === "deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => deleteTransaction.mutate(tx.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
