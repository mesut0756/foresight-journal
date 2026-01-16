import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfMonth, subMonths, format } from 'date-fns';

export interface DashboardStats {
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  maxDrawdown: number;
}

export interface EquityCurvePoint {
  date: string;
  equity: number;
}

export interface WinLossData {
  name: string;
  value: number;
  fill: string;
}

export interface PairPerformance {
  pair: string;
  trades: number;
  winRate: number;
  profit: number;
}

export interface MonthlyPerformance {
  month: string;
  profit: number;
  trades: number;
}

export function useDashboardStats() {
  const { user } = useAuth();

  const statsQuery = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: trades, error } = await supabase
        .from('trades')
        .select('result, profit_loss, created_at')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const totalTrades = trades.length;
      const wins = trades.filter(t => t.result === 'win').length;
      const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
      const totalProfit = trades.reduce((sum, t) => sum + (Number(t.profit_loss) || 0), 0);
      
      // Calculate max drawdown (simplified - consecutive losses)
      let maxDrawdown = 0;
      let currentDrawdown = 0;
      trades.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      for (const trade of trades) {
        const pl = Number(trade.profit_loss) || 0;
        if (pl < 0) {
          currentDrawdown += Math.abs(pl);
          maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
        } else {
          currentDrawdown = 0;
        }
      }
      
      return {
        totalTrades,
        winRate,
        totalProfit,
        maxDrawdown,
      } as DashboardStats;
    },
    enabled: !!user,
  });

  const equityCurveQuery = useQuery({
    queryKey: ['equity-curve', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: trades, error } = await supabase
        .from('trades')
        .select('profit_loss, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      let equity = 10000; // Starting equity
      const curve: EquityCurvePoint[] = [{ date: 'Start', equity }];
      
      trades.forEach((trade, index) => {
        equity += Number(trade.profit_loss) || 0;
        curve.push({
          date: format(new Date(trade.created_at), 'MMM d'),
          equity: Math.round(equity),
        });
      });
      
      return curve;
    },
    enabled: !!user,
  });

  const winLossQuery = useQuery({
    queryKey: ['win-loss', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: trades, error } = await supabase
        .from('trades')
        .select('result')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const wins = trades.filter(t => t.result === 'win').length;
      const losses = trades.filter(t => t.result === 'loss').length;
      
      return [
        { name: 'Wins', value: wins, fill: 'hsl(var(--primary))' },
        { name: 'Losses', value: losses, fill: 'hsl(var(--destructive))' },
      ] as WinLossData[];
    },
    enabled: !!user,
  });

  const pairPerformanceQuery = useQuery({
    queryKey: ['pair-performance', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: trades, error } = await supabase
        .from('trades')
        .select('pair, result, profit_loss')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const pairMap = new Map<string, { trades: number; wins: number; profit: number }>();
      
      trades.forEach(trade => {
        const existing = pairMap.get(trade.pair) || { trades: 0, wins: 0, profit: 0 };
        existing.trades++;
        if (trade.result === 'win') existing.wins++;
        existing.profit += Number(trade.profit_loss) || 0;
        pairMap.set(trade.pair, existing);
      });
      
      return Array.from(pairMap.entries()).map(([pair, stats]) => ({
        pair,
        trades: stats.trades,
        winRate: Math.round((stats.wins / stats.trades) * 100),
        profit: stats.profit,
      })) as PairPerformance[];
    },
    enabled: !!user,
  });

  const monthlyPerformanceQuery = useQuery({
    queryKey: ['monthly-performance', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: trades, error } = await supabase
        .from('trades')
        .select('profit_loss, created_at')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const monthMap = new Map<string, { profit: number; trades: number }>();
      
      // Initialize all 12 months of the current year
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthNames.forEach(month => {
        monthMap.set(month, { profit: 0, trades: 0 });
      });
      
      trades.forEach(trade => {
        const month = format(new Date(trade.created_at), 'MMM');
        const existing = monthMap.get(month) || { profit: 0, trades: 0 };
        existing.profit += Number(trade.profit_loss) || 0;
        existing.trades++;
        monthMap.set(month, existing);
      });
      
      return Array.from(monthMap.entries()).map(([month, stats]) => ({
        month,
        profit: stats.profit,
        trades: stats.trades,
      })) as MonthlyPerformance[];
    },
    enabled: !!user,
  });

  return {
    stats: statsQuery.data,
    equityCurve: equityCurveQuery.data ?? [],
    winLoss: winLossQuery.data ?? [],
    pairPerformance: pairPerformanceQuery.data ?? [],
    monthlyPerformance: monthlyPerformanceQuery.data ?? [],
    isLoading: statsQuery.isLoading,
  };
}
