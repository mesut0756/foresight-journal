import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Trade {
  id: string;
  user_id: string;
  pair: string;
  type: 'buy' | 'sell';
  entry_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  lot_size: number;
  risk_percent: number | null;
  pips: number | null;
  profit_loss: number | null;
  result: 'win' | 'loss' | 'breakeven' | null;
  strategy_id: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  strategies?: { name: string } | null;
}

export interface CreateTradeInput {
  pair: string;
  type: 'buy' | 'sell';
  entry_price: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  lot_size: number;
  risk_percent?: number | null;
  pips?: number | null;
  profit_loss?: number | null;
  result?: 'win' | 'loss' | 'breakeven' | null;
  strategy_id?: string | null;
  notes?: string | null;
  tags?: string[] | null;
}

export function useTrades() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tradesQuery = useQuery({
    queryKey: ['trades', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('trades')
        .select('*, strategies(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Trade[];
    },
    enabled: !!user,
  });

  const createTrade = useMutation({
    mutationFn: async (trade: CreateTradeInput) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('trades')
        .insert({ ...trade, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Trade added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add trade: ${error.message}`);
    },
  });

  const updateTrade = useMutation({
    mutationFn: async ({ id, ...trade }: Partial<Trade> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('trades')
        .update(trade)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Trade updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update trade: ${error.message}`);
    },
  });

  const deleteTrade = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Trade deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete trade: ${error.message}`);
    },
  });

  return {
    trades: tradesQuery.data ?? [],
    isLoading: tradesQuery.isLoading,
    error: tradesQuery.error,
    createTrade,
    updateTrade,
    deleteTrade,
  };
}
