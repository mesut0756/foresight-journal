import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface RiskRules {
  id: string;
  user_id: string;
  max_risk_per_trade: number;
  max_daily_loss: number;
  max_weekly_loss: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateRiskRulesInput {
  max_risk_per_trade?: number;
  max_daily_loss?: number;
  max_weekly_loss?: number;
}

export function useRiskRules() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const riskRulesQuery = useQuery({
    queryKey: ['risk-rules', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('risk_rules')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as RiskRules | null;
    },
    enabled: !!user,
  });

  const updateRiskRules = useMutation({
    mutationFn: async (rules: UpdateRiskRulesInput) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check if rules exist
      const { data: existing } = await supabase
        .from('risk_rules')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        const { data, error } = await supabase
          .from('risk_rules')
          .update(rules)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('risk_rules')
          .insert({ ...rules, user_id: user.id })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-rules'] });
      toast.success('Risk rules updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update risk rules: ${error.message}`);
    },
  });

  return {
    riskRules: riskRulesQuery.data,
    isLoading: riskRulesQuery.isLoading,
    error: riskRulesQuery.error,
    updateRiskRules,
  };
}
