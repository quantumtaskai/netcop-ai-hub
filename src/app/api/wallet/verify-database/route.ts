import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
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
    } catch (error: any) {
      console.error('Exception fetching transactions:', error)
      transactionsError = { message: 'Table likely does not exist', code: 'MISSING_TABLE' }
    }
    
    // Get users with wallet balances (handle missing columns gracefully)
    let users = []
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
    } catch (error: any) {
      console.error('Exception fetching users:', error)
      usersError = { message: 'Users table access failed', code: 'TABLE_ACCESS_ERROR' }
    }
    
    // Check for recent payments (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentTransactions, error: recentError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
    
    if (recentError) {
      console.error('Error fetching recent transactions:', recentError)
    }
    
    // Check for specific Stripe session from the screenshot
    const { data: stripeTransaction, error: stripeError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .ilike('stripe_session_id', '%cs_%')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (stripeError) {
      console.error('Error fetching Stripe transactions:', stripeError)
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
    
  } catch (error: any) {
    console.error('Database verification error:', error)
    return NextResponse.json(
      { error: 'Database verification failed', message: error.message },
      { status: 500 }
    )
  }
}