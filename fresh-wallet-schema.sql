-- =====================================================
-- NetCop AI Hub - Fresh Wallet System Schema
-- =====================================================
-- Clean wallet-only database schema without legacy data
-- Run in Supabase SQL Editor

-- =====================================================
-- STEP 1: Create fresh users table with wallet system
-- =====================================================

-- Drop existing users table if you want to start completely fresh
-- WARNING: This will delete all existing user data!
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Create fresh users table with wallet system only
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Create wallet_transactions table
-- =====================================================

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('top_up', 'agent_usage', 'refund')),
    description TEXT,
    agent_slug TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: Create indexes for performance
-- =====================================================

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Create indexes for wallet_transactions table
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_stripe_session_id ON public.wallet_transactions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_agent_slug ON public.wallet_transactions(agent_slug);

-- =====================================================
-- STEP 4: Enable Row Level Security
-- =====================================================

-- Enable RLS for both tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can insert own wallet transactions" ON public.wallet_transactions;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for wallet_transactions table
CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet transactions" ON public.wallet_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 5: Create trigger for updated_at
-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: Verification queries
-- =====================================================




-- =====================================================
-- STEP 7: Test data insertion (optional)
-- =====================================================

-- Example: Insert a test user (replace with actual auth user ID)
-- INSERT INTO public.users (id, email, name, wallet_balance) 
-- VALUES ('01234567-89ab-cdef-0123-456789abcdef', 'test@example.com', 'Test User', 25.00);

-- Example: Insert a test transaction
-- INSERT INTO public.wallet_transactions (user_id, amount, type, description) 
-- VALUES ('01234567-89ab-cdef-0123-456789abcdef', 25.00, 'top_up', 'Initial wallet balance');

-- =====================================================
-- Fresh Schema Complete!
-- =====================================================

-- After running this script:
-- ✅ Fresh users table with wallet_balance only
-- ✅ Clean wallet_transactions table
-- ✅ Proper indexes for performance
-- ✅ RLS policies configured
-- ✅ No legacy credit data
-- ✅ Ready for wallet system

SELECT 'Fresh wallet schema created successfully! 🎉' as status;