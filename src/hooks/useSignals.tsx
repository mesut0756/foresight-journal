import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AiSignal {
  id: string;
  pair: string | null;
  direction: string;
  entry: string | null;
  stop_loss: string | null;
  take_profit: string | null;
  risk_reward: string | null;
  analysis: string;
  screenshot_path: string | null;
  created_at: string;
  screenshot_url?: string | null;
}

const grab = (text: string, labels: string[]) => {
  for (const l of labels) {
    const m = text.match(new RegExp(`\\*{0,2}${l}\\*{0,2}\\s*[:：]\\s*\\*{0,2}([^\\n*]+)`, 'i'));
    if (m) return m[1].trim().slice(0, 80);
  }
  return null;
};

export function parseSignal(analysis: string) {
  const up = analysis.toUpperCase();
  const direction = /SIGNAL\**\s*:\s*\**\s*BUY|\*\*BUY\*\*|RECOMMENDATION: BUY/.test(up)
    ? 'buy'
    : /SIGNAL\**\s*:\s*\**\s*SELL|\*\*SELL\*\*|RECOMMENDATION: SELL/.test(up)
    ? 'sell'
    : 'neutral';
  return {
    direction,
    entry: grab(analysis, ['Entry(?: Price| Zone)?']),
    stop_loss: grab(analysis, ['Stop[ -]?Loss', 'SL']),
    take_profit: grab(analysis, ['Take[ -]?Profit(?: 1)?', 'TP1?']),
    risk_reward: grab(analysis, ['R:R', 'Risk[ -/]?(?:to[ -])?Reward(?: Ratio)?']),
  };
}

const dataUrlToBlob = async (dataUrl: string) => (await fetch(dataUrl)).blob();

export function useSignals() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['ai-signals', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_signals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as AiSignal[];
      const paths = rows.map((r) => r.screenshot_path).filter(Boolean) as string[];
      if (paths.length) {
        const { data: signed } = await supabase.storage.from('signal-charts').createSignedUrls(paths, 3600);
        const map = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
        rows.forEach((r) => (r.screenshot_url = r.screenshot_path ? map.get(r.screenshot_path) ?? null : null));
      }
      return rows;
    },
  });

  const save = useMutation({
    mutationFn: async ({ analysis, pair, imageDataUrl }: { analysis: string; pair: string; imageDataUrl: string | null }) => {
      if (!user) throw new Error('Not authenticated');
      let screenshot_path: string | null = null;
      if (imageDataUrl) {
        const blob = await dataUrlToBlob(imageDataUrl);
        const ext = blob.type.split('/')[1] || 'png';
        screenshot_path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from('signal-charts').upload(screenshot_path, blob, { contentType: blob.type });
        if (error) throw error;
      }
      const { error } = await supabase.from('ai_signals').insert({
        user_id: user.id,
        pair: pair || null,
        analysis,
        screenshot_path,
        ...parseSignal(analysis),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-signals'] });
      toast.success('Signal saved to history');
    },
    onError: (e: Error) => toast.error(`Failed to save signal: ${e.message}`),
  });

  const remove = useMutation({
    mutationFn: async (s: AiSignal) => {
      if (s.screenshot_path) await supabase.storage.from('signal-charts').remove([s.screenshot_path]);
      const { error } = await supabase.from('ai_signals').delete().eq('id', s.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-signals'] });
      toast.success('Signal deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { signals: list.data ?? [], isLoading: list.isLoading, save, remove };
}
