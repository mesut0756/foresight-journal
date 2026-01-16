import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface TradeScreenshot {
  id: string;
  trade_id: string;
  user_id: string;
  image_url: string;
  description: string | null;
  screenshot_type: 'before' | 'after';
  created_at: string;
}

export interface CreateScreenshotInput {
  trade_id: string;
  image_url: string;
  description?: string | null;
  screenshot_type: 'before' | 'after';
}

export function useTradeScreenshots(tradeId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const screenshotsQuery = useQuery({
    queryKey: ['trade-screenshots', tradeId],
    queryFn: async () => {
      if (!user || !tradeId) return [];
      const { data, error } = await supabase
        .from('trade_screenshots')
        .select('*')
        .eq('trade_id', tradeId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as TradeScreenshot[];
    },
    enabled: !!user && !!tradeId,
  });

  const uploadScreenshot = useMutation({
    mutationFn: async ({ 
      file, 
      tradeId, 
      screenshotType, 
      description 
    }: { 
      file: File; 
      tradeId: string; 
      screenshotType: 'before' | 'after';
      description?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${tradeId}/${screenshotType}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('trade-screenshots')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trade-screenshots')
        .getPublicUrl(fileName);
      
      // Create screenshot record
      const { data, error } = await supabase
        .from('trade_screenshots')
        .insert({
          trade_id: tradeId,
          user_id: user.id,
          image_url: publicUrl,
          description: description || null,
          screenshot_type: screenshotType,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trade-screenshots', variables.tradeId] });
      toast.success('Screenshot uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Failed to upload screenshot: ${error.message}`);
    },
  });

  const updateScreenshot = useMutation({
    mutationFn: async ({ id, description }: { id: string; description: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('trade_screenshots')
        .update({ description })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-screenshots'] });
      toast.success('Screenshot updated');
    },
    onError: (error) => {
      toast.error(`Failed to update screenshot: ${error.message}`);
    },
  });

  const deleteScreenshot = useMutation({
    mutationFn: async (screenshot: TradeScreenshot) => {
      if (!user) throw new Error('Not authenticated');
      
      // Extract file path from URL
      const urlParts = screenshot.image_url.split('/trade-screenshots/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('trade-screenshots').remove([filePath]);
      }
      
      const { error } = await supabase
        .from('trade_screenshots')
        .delete()
        .eq('id', screenshot.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-screenshots'] });
      toast.success('Screenshot deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete screenshot: ${error.message}`);
    },
  });

  return {
    screenshots: screenshotsQuery.data ?? [],
    isLoading: screenshotsQuery.isLoading,
    uploadScreenshot,
    updateScreenshot,
    deleteScreenshot,
  };
}
