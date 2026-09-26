CREATE TABLE public.ai_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pair text,
  direction text NOT NULL DEFAULT 'neutral',
  entry text,
  stop_loss text,
  take_profit text,
  risk_reward text,
  analysis text NOT NULL,
  screenshot_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_signals TO authenticated;
GRANT ALL ON public.ai_signals TO service_role;
ALTER TABLE public.ai_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own signals" ON public.ai_signals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER ai_signals_updated_at BEFORE UPDATE ON public.ai_signals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users read own signal charts" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'signal-charts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own signal charts" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'signal-charts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own signal charts" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'signal-charts' AND auth.uid()::text = (storage.foldername(name))[1]);