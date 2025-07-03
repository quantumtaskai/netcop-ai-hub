import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Debug: Starting verification debug...')
    
    // Check environment variables
    const stripeKey = process.env.STRIPE_SECRET_KEY
    console.log('Debug: Stripe key exists:', !!stripeKey)
    console.log('Debug: Stripe key starts with:', stripeKey?.substring(0, 10))
    
    // Test database connection
    console.log('Debug: Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    console.log('Debug: Database test result:', { testData, testError })
    
    // Check if wallet_transactions table exists
    console.log('Debug: Checking wallet_transactions table...')
    const { data: tableData, error: tableError } = await supabase
      .from('wallet_transactions')
      .select('count')
      .limit(1)
    
    console.log('Debug: Table check result:', { tableData, tableError })
    
    // Try to parse request body
    let body
    try {
      body = await request.json()
      console.log('Debug: Request body:', body)
    } catch (bodyError) {
      console.log('Debug: Body parse error:', bodyError)
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        stripeKeyExists: !!stripeKey,
        stripeKeyPrefix: stripeKey?.substring(0, 10),
        databaseConnection: !testError,
        tableExists: !tableError,
        requestBody: body,
        errors: {
          testError,
          tableError
        }
      }
    })
    
  } catch (error: any) {
    console.error('Debug: Error in debug endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}