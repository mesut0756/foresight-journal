-- Create profiles table for user data (username-based auth)
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create strategies table
CREATE TABLE public.strategies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trades table
CREATE TABLE public.trades (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
    entry_price DECIMAL(20, 5) NOT NULL,
    stop_loss DECIMAL(20, 5),
    take_profit DECIMAL(20, 5),
    lot_size DECIMAL(10, 4) NOT NULL,
    risk_percent DECIMAL(5, 2),
    pips DECIMAL(10, 2),
    profit_loss DECIMAL(20, 2),
    result TEXT CHECK (result IN ('win', 'loss', 'breakeven')),
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk_rules table
CREATE TABLE public.risk_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    max_risk_per_trade DECIMAL(5, 2) NOT NULL DEFAULT 2.0,
    max_daily_loss DECIMAL(5, 2) NOT NULL DEFAULT 5.0,
    max_weekly_loss DECIMAL(5, 2) NOT NULL DEFAULT 10.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pair_stats table for tracking pair performance
CREATE TABLE public.pair_stats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair TEXT NOT NULL,
    total_trades INTEGER NOT NULL DEFAULT 0,
    win_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    profit_loss DECIMAL(20, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, pair)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pair_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Strategies policies
CREATE POLICY "Users can view their own strategies" ON public.strategies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own strategies" ON public.strategies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies" ON public.strategies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies" ON public.strategies
    FOR DELETE USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can view their own trades" ON public.trades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades" ON public.trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" ON public.trades
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades" ON public.trades
    FOR DELETE USING (auth.uid() = user_id);

-- Risk rules policies
CREATE POLICY "Users can view their own risk rules" ON public.risk_rules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own risk rules" ON public.risk_rules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk rules" ON public.risk_rules
    FOR UPDATE USING (auth.uid() = user_id);

-- Pair stats policies
CREATE POLICY "Users can view their own pair stats" ON public.pair_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pair stats" ON public.pair_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pair stats" ON public.pair_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_risk_rules_updated_at
    BEFORE UPDATE ON public.risk_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pair_stats_updated_at
    BEFORE UPDATE ON public.pair_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup (creates profile and default risk rules)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default risk rules for new user
    INSERT INTO public.risk_rules (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to run after user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();