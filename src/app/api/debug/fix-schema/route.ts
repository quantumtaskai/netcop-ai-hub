import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DATABASE SCHEMA FIX ===')
    
    const results = {
      timestamp: new Date().toISOString(),
      steps: [],
      success: false,
      errors: []
    }
    
    // Step 1: Check if wallet_balance column exists in users table
    console.log('Step 1: Checking users table structure...')
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      
      if (usersError) {
        results.errors.push(`Users table error: ${usersError.message}`)
        results.steps.push({ step: 1, action: 'check_users_table', status: 'failed', error: usersError.message })
      } else {
        const hasWalletBalance = usersData[0] && 'wallet_balance' in usersData[0]
        const hasCredits = usersData[0] && 'credits' in usersData[0]
        
        results.steps.push({ 
          step: 1, 
          action: 'check_users_table', 
          status: 'success', 
          hasWalletBalance,
          hasCredits,
          columns: usersData[0] ? Object.keys(usersData[0]) : []
        })
        
        console.log('✅ Users table checked')
        console.log('- Has wallet_balance:', hasWalletBalance)
        console.log('- Has credits:', hasCredits)
      }
    } catch (error: any) {
      results.errors.push(`Users table exception: ${error.message}`)
      results.steps.push({ step: 1, action: 'check_users_table', status: 'exception', error: error.message })
    }
    
    // Step 2: Check if wallet_transactions table exists
    console.log('Step 2: Checking wallet_transactions table...')
    try {
      const { data: walletData, error: walletError } = await supabase
        .from('wallet_transactions')
        .select('count')
        .limit(1)
      
      if (walletError) {
        console.log('❌ wallet_transactions table does not exist')
        results.steps.push({ 
          step: 2, 
          action: 'check_wallet_transactions', 
          status: 'missing', 
          error: walletError.message 
        })
      } else {
        console.log('✅ wallet_transactions table exists')
        results.steps.push({ step: 2, action: 'check_wallet_transactions', status: 'exists' })
      }
    } catch (error: any) {
      results.steps.push({ 
        step: 2, 
        action: 'check_wallet_transactions', 
        status: 'exception', 
        error: error.message 
      })
    }
    
    // Step 3: Provide SQL scripts for manual execution
    console.log('Step 3: Generating SQL fix scripts...')
    
    const sqlScripts = {
      addWalletBalanceColumn: `
-- Add wallet_balance column to users table (if missing)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00;
`,
      
      createWalletTransactionsTable: `
-- Create wallet_transactions table (if missing)
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
`,
      
      createIndexes: `
-- Create indexes for wallet_transactions table
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_stripe_session_id ON public.wallet_transactions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at);
`,
      
      enableRLS: `
-- Enable RLS for wallet_transactions table
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallet_transactions table
CREATE POLICY IF NOT EXISTS "Users can view own wallet transactions" ON public.wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own wallet transactions" ON public.wallet_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
`,
      
      migrateCreditsToWallet: `
-- Migrate existing credits to wallet_balance (if needed)
-- Note: Run this only if you want to convert existing credit values
-- UPDATE public.users 
-- SET wallet_balance = COALESCE(credits, 0) * 0.10  -- Convert credits to AED (adjust ratio as needed)
-- WHERE wallet_balance = 0 AND credits > 0;
`
    }
    
    results.steps.push({ 
      step: 3, 
      action: 'generate_sql_scripts', 
      status: 'success',
      sqlScripts 
    })
    
    console.log('=== SCHEMA FIX COMPLETE ===')
    
    return NextResponse.json({
      success: true,
      message: 'Schema investigation and fix scripts generated',
      results,
      instructions: {
        message: 'Execute these SQL scripts in your Supabase SQL editor to fix the schema',
        steps: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Execute the provided SQL scripts in order',
          '4. Test the wallet system after applying fixes'
        ]
      }
    })
    
  } catch (error: any) {
    console.error('=== SCHEMA FIX FAILED ===')
    console.error('Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Schema fix failed',
      details: {
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 })
  }
}