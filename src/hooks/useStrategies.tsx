import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface StrategyWithStats extends Strategy {
  trades: number;
  winRate: number;
  profit: number;
}

export interface CreateStrategyInput {
  name: string;
  description?: string | null;
}

export function useStrategies() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const strategiesQuery = useQuery({
    queryKey: ['strategies', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Strategy[];
    },
    enabled: !!user,
  });

  const strategiesWithStatsQuery = useQuery({
    queryKey: ['strategies-with-stats', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get strategies
      const { data: strategies, error: stratError } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (stratError) throw stratError;
      
      // Get trades for stats
      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select('strategy_id, result, profit_loss')
        .eq('user_id', user.id);
      
      if (tradesError) throw tradesError;
      
      // Calculate stats for each strategy
      return strategies.map((strategy) => {
        const stratTrades = trades.filter(t => t.strategy_id === strategy.id);
        const wins = stratTrades.filter(t => t.result === 'win').length;
        const totalProfit = stratTrades.reduce((sum, t) => sum + (Number(t.profit_loss) || 0), 0);
        
        return {
          ...strategy,
          trades: stratTrades.length,
          winRate: stratTrades.length > 0 ? Math.round((wins / stratTrades.length) * 100) : 0,
          profit: totalProfit,
        } as StrategyWithStats;
      });
    },
    enabled: !!user,
  });

  const createStrategy = useMutation({
    mutationFn: async (strategy: CreateStrategyInput) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('strategies')
        .insert({ ...strategy, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['strategies-with-stats'] });
      toast.success('Strategy created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create strategy: ${error.message}`);
    },
  });

  const updateStrategy = useMutation({
    mutationFn: async ({ id, ...strategy }: Partial<Strategy> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('strategies')
        .update(strategy)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['strategies-with-stats'] });
      toast.success('Strategy updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update strategy: ${error.message}`);
    },
  });

  const deleteStrategy = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['strategies-with-stats'] });
      toast.success('Strategy deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete strategy: ${error.message}`);
    },
  });

  return {
    strategies: strategiesQuery.data ?? [],
    strategiesWithStats: strategiesWithStatsQuery.data ?? [],
    isLoading: strategiesQuery.isLoading || strategiesWithStatsQuery.isLoading,
    error: strategiesQuery.error,
    createStrategy,
    updateStrategy,
    deleteStrategy,
  };
}
