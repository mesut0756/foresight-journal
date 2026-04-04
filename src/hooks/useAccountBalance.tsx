import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useAccountBalance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const balanceQuery = useQuery({
    queryKey: ['account-balance', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from('profiles')
        .select('account_balance')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return Number(data?.account_balance ?? 0);
    },
    enabled: !!user,
  });

  const updateBalance = useMutation({
    mutationFn: async (newBalance: number) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ account_balance: newBalance })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-balance'] });
      toast.success('Account balance updated');
    },
    onError: (error) => {
      toast.error(`Failed to update balance: ${error.message}`);
    },
  });

  return {
    balance: balanceQuery.data ?? 0,
    isLoading: balanceQuery.isLoading,
    updateBalance,
  };
}
