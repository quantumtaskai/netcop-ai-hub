import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/server'
import { WALLET_PACKAGES, calculateTotalAmount } from '@/lib/walletUtils'

export async function POST(request: NextRequest) {
  console.log('🔍 Wallet verify-payment API called at:', new Date().toISOString())
  
  try {
    // Check if Stripe secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY environment variable is not set')
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    console.log('✅ Stripe secret key found, initializing Stripe...')

    // Initialize Stripe after environment check
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    })

    const { sessionId, packageId } = await request.json()
    console.log('📥 Request payload:', { sessionId, packageId })

    if (!sessionId || !packageId) {
      console.error('❌ Missing required parameters:', { sessionId: !!sessionId, packageId: !!packageId })
      return NextResponse.json(
        { error: 'Missing session ID or package ID' },
        { status: 400 }
      )
    }

    console.log('✅ Valid parameters received, verifying payment:', { sessionId, packageId })

    // Retrieve the checkout session from Stripe
    let session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError)
      return NextResponse.json(
        { error: 'Invalid session ID or Stripe error', details: stripeError.message },
        { status: 400 }
      )
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      )
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get user ID from session
    const userId = session.client_reference_id || session.metadata?.user_id
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      )
    }

    // Find the wallet package
    const walletPackage = WALLET_PACKAGES.find(pkg => pkg.id === packageId)
    if (!walletPackage) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      )
    }

    // Calculate total amount to add (base + bonus)
    const totalAmount = calculateTotalAmount(packageId)

    console.log('Adding wallet balance:', {
      userId,
      packageId,
      baseAmount: walletPackage.amount,
      bonusAmount: walletPackage.bonus || 0,
      totalAmount
    })

    // Check if this payment has already been processed
    const { data: existingTransaction, error: checkError } = await supabaseAdmin
      .from('wallet_transactions')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected for new payments
      console.error('Error checking existing transaction:', checkError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    if (existingTransaction) {
      console.log('Payment already processed:', sessionId)
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      )
    }

    // Get current user balance
    console.log('🔍 Fetching user data for userId:', userId)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ Error fetching user:', {
        error: userError,
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        userId
      })
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ User found:', { userId, currentBalance: userData.wallet_balance })

    const currentBalance = userData.wallet_balance || 0
    const newBalance = currentBalance + totalAmount

    console.log('💰 Calculating new balance:', { 
      currentBalance, 
      totalAmount, 
      newBalance,
      userId 
    })

    // Update user wallet balance
    console.log('📝 Updating wallet balance in database...')
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating wallet balance:', {
        error: updateError,
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        userId,
        newBalance,
        operation: 'wallet_balance_update'
      })
      return NextResponse.json(
        { error: 'Failed to update wallet balance' },
        { status: 500 }
      )
    }

    console.log('✅ Wallet balance updated successfully:', { 
      userId, 
      oldBalance: currentBalance, 
      newBalance: updatedUser.wallet_balance 
    })

    // Create transaction record
    console.log('📋 Creating transaction record...')
    const transactionData = {
      user_id: userId,
      amount: totalAmount,
      type: 'top_up' as const,
      description: `Wallet top-up: ${walletPackage.label}${walletPackage.bonus ? ` (+${walletPackage.bonus} AED bonus)` : ''}`,
      stripe_session_id: sessionId
    }
    console.log('📋 Transaction data:', transactionData)

    const { error: transactionError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert(transactionData)

    if (transactionError) {
      console.error('❌ Error creating transaction record:', {
        error: transactionError,
        code: transactionError.code,
        message: transactionError.message,
        details: transactionError.details,
        hint: transactionError.hint,
        transactionData,
        operation: 'transaction_insert'
      })
      // Don't return error here as the wallet was already updated
    } else {
      console.log('✅ Transaction record created successfully')
    }

    console.log('🎉 Wallet payment verified successfully:', {
      userId,
      sessionId,
      amountAdded: totalAmount,
      newBalance
    })

    const response = {
      success: true,
      amount: totalAmount,
      newBalance,
      transaction: {
        amount: totalAmount,
        type: 'top_up',
        description: `Wallet top-up: ${walletPackage.label}${walletPackage.bonus ? ` (+${walletPackage.bonus} AED bonus)` : ''}`
      }
    }

    console.log('📤 Sending response:', response)
    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Wallet payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}