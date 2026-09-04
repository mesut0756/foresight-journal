import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DailyGoal {
  id: string;
  user_id: string;
  goal_date: string;
  max_trades: number;
  max_loss: number;
  mindset: string | null;
  mistakes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyGoalInput {
  goal_date: string;
  max_trades: number;
  max_loss: number;
  mindset?: string | null;
  mistakes?: string | null;
}

export function useDailyGoals(date: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const goalQuery = useQuery({
    queryKey: ['daily-goal', user?.id, date],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('goal_date', date)
        .maybeSingle();
      if (error) throw error;
      return data as DailyGoal | null;
    },
    enabled: !!user,
  });

  const historyQuery = useQuery({
    queryKey: ['daily-goals-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('goal_date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as DailyGoal[];
    },
    enabled: !!user,
  });

  const saveGoal = useMutation({
    mutationFn: async (input: DailyGoalInput) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('daily_goals')
        .upsert({ ...input, user_id: user.id }, { onConflict: 'user_id,goal_date' })
        .select()
        .single();
      if (error) throw error;
      return data as DailyGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-goal'] });
      queryClient.invalidateQueries({ queryKey: ['daily-goals-history'] });
      toast.success('Daily plan saved');
    },
    onError: (error: Error) => toast.error(`Failed to save: ${error.message}`),
  });

  return {
    goal: goalQuery.data ?? null,
    history: historyQuery.data ?? [],
    isLoading: goalQuery.isLoading,
    saveGoal,
  };
}
