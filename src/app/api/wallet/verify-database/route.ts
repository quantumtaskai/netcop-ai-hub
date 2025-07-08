import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  // Skip during build process when environment variables are placeholders
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your_supabase_url_here') ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('your_supabase_anon_key_here')) {
    return NextResponse.json({
      status: 'build_mode',
      message: 'Database verification skipped during build process'
    }, { status: 200 })
  }

  try {
    console.log('Verifying database state...')
    
    // Get recent wallet transactions (handle missing table gracefully)
    let transactions = []
    let transactionsError = null
    
    try {
      const { data: transactionsData, error: transErr } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (transErr) {
        console.error('Error fetching transactions:', transErr)
        transactionsError = transErr
        // Don't return error immediately - continue to check other tables
      } else {
        transactions = transactionsData || []
      }
    } catch (error: unknown) {
      console.error('Exception fetching transactions:', error)
      transactionsError = { message: 'Table likely does not exist', code: 'MISSING_TABLE' }
    }
    
    // Get users with wallet balances (handle missing columns gracefully)
    let users: Record<string, unknown>[] = []
    let usersError = null
    
    try {
      const { data: usersData, error: userErr } = await supabase
        .from('users')
        .select('id, email, name, wallet_balance, credits, updated_at')
        .order('updated_at', { ascending: false })
        .limit(10)
      
      if (userErr) {
        console.error('Error fetching users:', userErr)
        usersError = userErr
        // Try with just basic columns if wallet_balance doesn't exist
        const { data: basicUsersData, error: basicErr } = await supabase
          .from('users')
          .select('id, email, name, credits, updated_at')
          .order('updated_at', { ascending: false })
          .limit(10)
        
        if (!basicErr) {
          users = basicUsersData || []
          usersError = { message: 'wallet_balance column missing, found credits instead' }
        }
      } else {
        users = usersData || []
      }
    } catch (error: unknown) {
      console.error('Exception fetching users:', error)
      usersError = { message: 'Users table access failed', code: 'TABLE_ACCESS_ERROR' }
    }
    
    // Check for recent payments (last 24 hours) - handle missing table
    let recentTransactions = []
    let recentError = null
    
    if (!transactionsError) {
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: recentData, error: recentErr } = await supabase
          .from('wallet_transactions')
          .select('*')
          .gte('created_at', twentyFourHoursAgo)
          .order('created_at', { ascending: false })
        
        if (recentErr) {
          console.error('Error fetching recent transactions:', recentErr)
          recentError = recentErr
        } else {
          recentTransactions = recentData || []
        }
      } catch {
        recentError = { message: 'Recent transactions query failed', code: 'QUERY_ERROR' }
      }
    } else {
      recentError = { message: 'Skipped due to missing wallet_transactions table' }
    }
    
    // Check for specific Stripe session - handle missing table
    let stripeTransaction = []
    let stripeError = null
    
    if (!transactionsError) {
      try {
        const { data: stripeData, error: stripeErr } = await supabase
          .from('wallet_transactions')
          .select('*')
          .ilike('stripe_session_id', '%cs_%')
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (stripeErr) {
          console.error('Error fetching Stripe transactions:', stripeErr)
          stripeError = stripeErr
        } else {
          stripeTransaction = stripeData || []
        }
      } catch {
        stripeError = { message: 'Stripe transactions query failed', code: 'QUERY_ERROR' }
      }
    } else {
      stripeError = { message: 'Skipped due to missing wallet_transactions table' }
    }
    
    return NextResponse.json({
      success: !transactionsError && !usersError, // Only success if no critical errors
      data: {
        allTransactions: transactions || [],
        users: users || [],
        recentTransactions: recentTransactions || [],
        stripeTransactions: stripeTransaction || [],
        summary: {
          totalTransactions: transactions?.length || 0,
          totalUsers: users?.length || 0,
          recentTransactionsCount: recentTransactions?.length || 0,
          stripeTransactionsCount: stripeTransaction?.length || 0
        }
      },
      errors: {
        transactionsError,
        usersError,
        recentError,
        stripeError
      },
      message: transactionsError || usersError ? 
        'Database schema issues detected - some tables/columns may be missing' : 
        'Database verification completed successfully'
    })
    
  } catch (error: unknown) {
    console.error('Database verification error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database verification failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred during database verification',
      details: {
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : undefined,
        errorStack: error instanceof Error ? error.stack?.split('\n')?.slice(0, 3) : undefined // First 3 lines of stack
      }
    }, { status: 500 })
  }
}