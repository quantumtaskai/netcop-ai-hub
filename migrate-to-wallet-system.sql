-- =====================================================
-- NetCop AI Hub - Wallet System Migration Script
-- =====================================================
-- This script migrates from credit system to wallet system
-- Run in Supabase SQL Editor

-- =====================================================
-- STEP 1: Add wallet_balance column to users table
-- =====================================================

-- Add wallet_balance column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00;

-- Convert existing credits to AED wallet balance
-- (1 credit = 0.10 AED - adjust ratio as needed)
-- Only update users who don't already have a wallet balance
UPDATE public.users 
SET wallet_balance = credits * 0.10 
WHERE wallet_balance = 0.00 AND credits > 0;

-- =====================================================
-- STEP 2: Create wallet_transactions table
-- =====================================================

-- Create wallet_transactions table
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

-- Create indexes for wallet_transactions table
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id 
ON public.wallet_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_stripe_session_id 
ON public.wallet_transactions(stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at 
ON public.wallet_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type 
ON public.wallet_transactions(type);

-- =====================================================
-- STEP 4: Enable Row Level Security
-- =====================================================

-- Enable RLS for wallet_transactions table
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can insert own wallet transactions" ON public.wallet_transactions;

-- Create RLS policies for wallet_transactions table
CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet transactions" ON public.wallet_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 5: Verification queries
-- =====================================================

-- Check users table structure (should show both credits and wallet_balance)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('credits', 'wallet_balance')
ORDER BY column_name;

-- Check wallet_transactions table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'wallet_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check user balances after migration
SELECT 
    id, 
    email, 
    name,
    credits as old_credits, 
    wallet_balance as new_wallet_balance,
    created_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 5;

-- Check if wallet_transactions table is empty (should be empty initially)
SELECT COUNT(*) as transaction_count 
FROM public.wallet_transactions;

-- =====================================================
-- STEP 6: Test data insertion (optional)
-- =====================================================

-- Test inserting a sample transaction (replace with actual user ID)
-- INSERT INTO public.wallet_transactions (
--     user_id, 
--     amount, 
--     type, 
--     description
-- ) VALUES (
--     '04e3e179-a692-45e0-9f10-68908210c4c7', 
--     10.00, 
--     'top_up', 
--     'Test wallet top-up migration'
-- );

-- =====================================================
-- Migration Complete!
-- =====================================================

-- After running this script:
-- ✅ users table has wallet_balance column
-- ✅ wallet_transactions table exists with proper indexes
-- ✅ RLS policies are configured
-- ✅ Existing credits converted to wallet balance
-- ✅ Ready for wallet system to work

SELECT 'Migration completed successfully! 🎉' as status;