import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Verifying database state...')
    
    // Get recent wallet transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions', details: transactionsError },
        { status: 500 }
      )
    }
    
    // Get users with wallet balances
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, wallet_balance, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10)
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError },
        { status: 500 }
      )
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
      success: true,
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
      }
    })
    
  } catch (error: any) {
    console.error('Database verification error:', error)
    return NextResponse.json(
      { error: 'Database verification failed', message: error.message },
      { status: 500 }
    )
  }
}