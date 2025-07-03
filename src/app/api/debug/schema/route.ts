import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DATABASE SCHEMA INVESTIGATION ===')
    
    const results = {
      timestamp: new Date().toISOString(),
      supabaseConnection: false,
      tables: {},
      errors: []
    }
    
    // 1. Test basic connection
    console.log('Testing Supabase connection...')
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (!connectionError) {
        results.supabaseConnection = true
        console.log('✅ Supabase connection successful')
      } else {
        console.error('❌ Supabase connection failed:', connectionError)
        results.errors.push(`Connection error: ${connectionError.message}`)
      }
    } catch (connError: any) {
      console.error('❌ Supabase connection exception:', connError)
      results.errors.push(`Connection exception: ${connError.message}`)
    }
    
    // 2. Check users table structure
    console.log('Checking users table structure...')
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      
      if (!usersError && usersData) {
        console.log('✅ Users table found')
        results.tables.users = {
          exists: true,
          sampleData: usersData[0] || null,
          columns: usersData[0] ? Object.keys(usersData[0]) : []
        }
        
        // Check specifically for wallet_balance vs credits
        if (usersData[0]) {
          results.tables.users.hasWalletBalance = 'wallet_balance' in usersData[0]
          results.tables.users.hasCredits = 'credits' in usersData[0]
          console.log('- Has wallet_balance:', results.tables.users.hasWalletBalance)
          console.log('- Has credits:', results.tables.users.hasCredits)
        }
      } else {
        console.error('❌ Users table error:', usersError)
        results.tables.users = {
          exists: false,
          error: usersError?.message
        }
      }
    } catch (usersException: any) {
      console.error('❌ Users table exception:', usersException)
      results.tables.users = {
        exists: false,
        error: usersException.message
      }
    }
    
    // 3. Check wallet_transactions table
    console.log('Checking wallet_transactions table...')
    try {
      const { data: walletData, error: walletError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .limit(1)
      
      if (!walletError) {
        console.log('✅ wallet_transactions table found')
        results.tables.wallet_transactions = {
          exists: true,
          sampleData: walletData[0] || null,
          columns: walletData[0] ? Object.keys(walletData[0]) : [],
          recordCount: walletData.length
        }
      } else {
        console.error('❌ wallet_transactions table error:', walletError)
        results.tables.wallet_transactions = {
          exists: false,
          error: walletError.message
        }
      }
    } catch (walletException: any) {
      console.error('❌ wallet_transactions table exception:', walletException)
      results.tables.wallet_transactions = {
        exists: false,
        error: walletException.message
      }
    }
    
    // 4. Check other tables that might exist
    const tablesToCheck = ['usage_history', 'agents']
    
    for (const tableName of tablesToCheck) {
      console.log(`Checking ${tableName} table...`)
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (!tableError) {
          console.log(`✅ ${tableName} table found`)
          results.tables[tableName] = {
            exists: true,
            sampleData: tableData[0] || null,
            columns: tableData[0] ? Object.keys(tableData[0]) : [],
            recordCount: tableData.length
          }
        } else {
          console.error(`❌ ${tableName} table error:`, tableError)
          results.tables[tableName] = {
            exists: false,
            error: tableError.message
          }
        }
      } catch (tableException: any) {
        console.error(`❌ ${tableName} table exception:`, tableException)
        results.tables[tableName] = {
          exists: false,
          error: tableException.message
        }
      }
    }
    
    // 5. Try to get table list from information schema
    console.log('Attempting to get table list...')
    try {
      const { data: tableList, error: listError } = await supabase
        .rpc('get_table_list')
      
      if (!listError && tableList) {
        results.allTables = tableList
      }
    } catch (listException) {
      console.log('Could not get table list (expected if RPC not available)')
    }
    
    console.log('=== SCHEMA INVESTIGATION COMPLETE ===')
    console.log('Results:', JSON.stringify(results, null, 2))
    
    return NextResponse.json({
      success: true,
      investigation: results
    })
    
  } catch (error: any) {
    console.error('=== SCHEMA INVESTIGATION FAILED ===')
    console.error('Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Schema investigation failed',
      details: {
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 })
  }
}