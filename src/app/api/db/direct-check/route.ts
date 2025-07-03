import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('=== DIRECT DATABASE CHECK ===')
    
    const results = {
      timestamp: new Date().toISOString(),
      tables: {},
      errors: []
    }
    
    // 1. Check users table directly
    console.log('Checking users table...')
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      
      if (usersError) {
        results.errors.push(`users table error: ${usersError.message}`)
        results.tables.users = { exists: false, error: usersError.message }
      } else {
        const firstUser = usersData[0]
        results.tables.users = {
          exists: true,
          columns: firstUser ? Object.keys(firstUser) : [],
          sampleRecord: firstUser,
          hasWalletBalance: firstUser && 'wallet_balance' in firstUser,
          hasCredits: firstUser && 'credits' in firstUser,
          recordCount: usersData.length
        }
        console.log('✅ users table found with columns:', Object.keys(firstUser || {}))
      }
    } catch (error: any) {
      results.errors.push(`users table exception: ${error.message}`)
      results.tables.users = { exists: false, exception: error.message }
    }
    
    // 2. Check wallet_transactions table directly
    console.log('Checking wallet_transactions table...')
    try {
      const { data: walletData, error: walletError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .limit(1)
      
      if (walletError) {
        results.errors.push(`wallet_transactions table error: ${walletError.message}`)
        results.tables.wallet_transactions = { exists: false, error: walletError.message }
      } else {
        const firstTransaction = walletData[0]
        results.tables.wallet_transactions = {
          exists: true,
          columns: firstTransaction ? Object.keys(firstTransaction) : [],
          sampleRecord: firstTransaction,
          recordCount: walletData.length
        }
        console.log('✅ wallet_transactions table found with columns:', Object.keys(firstTransaction || {}))
      }
    } catch (error: any) {
      results.errors.push(`wallet_transactions table exception: ${error.message}`)
      results.tables.wallet_transactions = { exists: false, exception: error.message }
    }
    
    // 3. Check other tables
    const otherTables = ['usage_history', 'agents']
    for (const tableName of otherTables) {
      console.log(`Checking ${tableName} table...`)
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (tableError) {
          results.tables[tableName] = { exists: false, error: tableError.message }
        } else {
          const firstRecord = tableData[0]
          results.tables[tableName] = {
            exists: true,
            columns: firstRecord ? Object.keys(firstRecord) : [],
            sampleRecord: firstRecord,
            recordCount: tableData.length
          }
          console.log(`✅ ${tableName} table found`)
        }
      } catch (error: any) {
        results.tables[tableName] = { exists: false, exception: error.message }
      }
    }
    
    // 4. Summary
    const summary = {
      usersTableExists: results.tables.users?.exists || false,
      walletTransactionsExists: results.tables.wallet_transactions?.exists || false,
      hasWalletBalance: results.tables.users?.hasWalletBalance || false,
      hasCredits: results.tables.users?.hasCredits || false,
      usersColumns: results.tables.users?.columns || [],
      totalErrors: results.errors.length
    }
    
    console.log('=== DIRECT CHECK SUMMARY ===')
    console.log('Users table exists:', summary.usersTableExists)
    console.log('Wallet transactions exists:', summary.walletTransactionsExists)
    console.log('Has wallet_balance column:', summary.hasWalletBalance)
    console.log('Has credits column:', summary.hasCredits)
    console.log('Users columns:', summary.usersColumns)
    
    return NextResponse.json({
      success: true,
      results,
      summary,
      recommendations: {
        needsWalletBalance: !summary.hasWalletBalance,
        needsWalletTransactions: !summary.walletTransactionsExists,
        canMigrate: summary.hasCredits && !summary.hasWalletBalance,
        readyForWallet: summary.hasWalletBalance && summary.walletTransactionsExists
      }
    })
    
  } catch (error: any) {
    console.error('=== DIRECT CHECK FAILED ===', error)
    return NextResponse.json({
      success: false,
      error: 'Direct database check failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}