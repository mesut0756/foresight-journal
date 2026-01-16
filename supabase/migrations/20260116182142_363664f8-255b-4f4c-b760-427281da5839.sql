-- Add tags column to trades table
ALTER TABLE public.trades ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create storage bucket for trade screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('trade-screenshots', 'trade-screenshots', true);

-- Create storage policies for trade screenshots
CREATE POLICY "Users can upload their own trade screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own trade screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own trade screenshots"
ON storage.objects FOR DELETE
USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Trade screenshots are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'trade-screenshots');

-- Create trade_screenshots table
CREATE TABLE public.trade_screenshots (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    description TEXT,
    screenshot_type TEXT NOT NULL CHECK (screenshot_type IN ('before', 'after')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trade_screenshots
ALTER TABLE public.trade_screenshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trade_screenshots
CREATE POLICY "Users can view their own trade screenshots"
ON public.trade_screenshots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trade screenshots"
ON public.trade_screenshots FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trade screenshots"
ON public.trade_screenshots FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trade screenshots"
ON public.trade_screenshots FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_trade_screenshots_trade_id ON public.trade_screenshots(trade_id);