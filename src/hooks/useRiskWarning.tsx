import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRiskRules } from './useRiskRules';
import { useAccountBalance } from './useAccountBalance';
import { startOfDay, startOfWeek, format } from 'date-fns';

export interface RiskWarning {
  type: 'daily' | 'weekly' | 'goal';
  percentUsed: number;
  message: string;
}

/**
 * Effective daily loss limit in $: the stricter of the Risk Management rule
 * (% of real balance) and today's Daily Goals max loss (if set).
 */
export function computeDailyLimit(balance: number, ruleDailyPct?: number | null, goalMaxLoss?: number | null) {
  const ruleLimit = ruleDailyPct && balance > 0 ? (ruleDailyPct / 100) * balance : 0;
  const goal = goalMaxLoss && goalMaxLoss > 0 ? goalMaxLoss : 0;
  if (ruleLimit && goal) return Math.min(ruleLimit, goal);
  return ruleLimit || goal;
}

export function useRiskWarning() {
  const { user } = useAuth();
  const { riskRules } = useRiskRules();
  const { balance } = useAccountBalance();

  const query = useQuery({
    queryKey: ['risk-warning', user?.id],
    queryFn: async () => {
      if (!user) return { dailyLoss: 0, weeklyLoss: 0, goalMaxLoss: 0 };

      const today = format(new Date(), 'yyyy-MM-dd');
      const [{ data: trades, error }, { data: goal }] = await Promise.all([
        supabase.from('trades').select('profit_loss, created_at').eq('user_id', user.id),
        supabase.from('daily_goals').select('max_loss').eq('user_id', user.id).eq('goal_date', today).maybeSingle(),
      ]);
      if (error) throw error;

      const todayStart = startOfDay(new Date());
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      let dailyPnl = 0;
      let weeklyPnl = 0;
      (trades ?? []).forEach((t) => {
        const date = new Date(t.created_at);
        const v = Number(t.profit_loss) || 0;
        if (date >= weekStart) weeklyPnl += v;
        if (date >= todayStart) dailyPnl += v;
      });

      return {
        dailyLoss: Math.max(0, -dailyPnl),
        weeklyLoss: Math.max(0, -weeklyPnl),
        goalMaxLoss: Number(goal?.max_loss) || 0,
      };
    },
    enabled: !!user,
    refetchInterval: 60000,
  });

  const warnings: RiskWarning[] = [];

  if (query.data) {
    const { dailyLoss, weeklyLoss, goalMaxLoss } = query.data;

    if (riskRules && balance > 0) {
      const maxDaily = (riskRules.max_daily_loss / 100) * balance;
      const maxWeekly = (riskRules.max_weekly_loss / 100) * balance;
      if (maxDaily > 0) {
        const pct = (dailyLoss / maxDaily) * 100;
        if (pct >= 80) warnings.push({ type: 'daily', percentUsed: Math.round(pct),
          message: `You've used ${Math.round(pct)}% of your max daily loss ($${maxDaily.toFixed(2)} = ${riskRules.max_daily_loss}% of $${balance.toLocaleString()}). Consider stopping for today.` });
      }
      if (maxWeekly > 0) {
        const pct = (weeklyLoss / maxWeekly) * 100;
        if (pct >= 80) warnings.push({ type: 'weekly', percentUsed: Math.round(pct),
          message: `You've used ${Math.round(pct)}% of your max weekly loss ($${maxWeekly.toFixed(2)}). Trade carefully.` });
      }
    }

    if (goalMaxLoss > 0) {
      const pct = (dailyLoss / goalMaxLoss) * 100;
      if (pct >= 80) warnings.push({ type: 'goal', percentUsed: Math.round(pct),
        message: `You've used ${Math.round(pct)}% of today's Daily Goal max loss ($${goalMaxLoss.toFixed(2)}).` });
    }
  }

  return { warnings, hasWarning: warnings.length > 0, isLoading: query.isLoading };
}
