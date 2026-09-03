import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRiskRules } from './useRiskRules';
import { useAccountBalance } from './useAccountBalance';
import { startOfDay, startOfWeek } from 'date-fns';

export interface RiskWarning {
  type: 'daily' | 'weekly';
  percentUsed: number;
  message: string;
}

export function useRiskWarning() {
  const { user } = useAuth();
  const { riskRules } = useRiskRules();
  const { balance } = useAccountBalance();

  const query = useQuery({
    queryKey: ['risk-warning', user?.id],
    queryFn: async () => {
      if (!user) return { dailyLoss: 0, weeklyLoss: 0 };

      const { data: trades, error } = await supabase
        .from('trades')
        .select('profit_loss, created_at')
        .eq('user_id', user.id)
        .lt('profit_loss', 0);

      if (error) throw error;

      const todayStart = startOfDay(new Date());
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

      let dailyLoss = 0;
      let weeklyLoss = 0;

      (trades ?? []).forEach((t) => {
        const date = new Date(t.created_at);
        const loss = Math.abs(Number(t.profit_loss) || 0);
        if (date >= weekStart) weeklyLoss += loss;
        if (date >= todayStart) dailyLoss += loss;
      });

      return { dailyLoss, weeklyLoss };
    },
    enabled: !!user,
    refetchInterval: 60000,
  });

  const warnings: RiskWarning[] = [];

  if (riskRules && balance > 0 && query.data) {
    const { dailyLoss, weeklyLoss } = query.data;

    const maxDaily = (riskRules.max_daily_loss / 100) * balance;
    const maxWeekly = (riskRules.max_weekly_loss / 100) * balance;

    if (maxDaily > 0) {
      const pct = (dailyLoss / maxDaily) * 100;
      if (pct >= 80) {
        warnings.push({
          type: 'daily',
          percentUsed: Math.round(pct),
          message: `You've used ${Math.round(pct)}% of your max daily loss (${riskRules.max_daily_loss}%). Consider stopping for today.`,
        });
      }
    }

    if (maxWeekly > 0) {
      const pct = (weeklyLoss / maxWeekly) * 100;
      if (pct >= 80) {
        warnings.push({
          type: 'weekly',
          percentUsed: Math.round(pct),
          message: `You've used ${Math.round(pct)}% of your max weekly loss (${riskRules.max_weekly_loss}%). Trade carefully.`,
        });
      }
    }
  }

  return {
    warnings,
    hasWarning: warnings.length > 0,
    isLoading: query.isLoading,
  };
}
