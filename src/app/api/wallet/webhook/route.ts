import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import { WALLET_PACKAGES, calculateTotalAmount } from '@/lib/walletUtils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const sig = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Wallet webhook received:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        // Check if this is a wallet top-up
        if (session.metadata?.type === 'wallet_topup') {
          await handleWalletTopUp(session)
        }
        break
      
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Wallet webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleWalletTopUp(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing wallet top-up webhook:', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      metadata: session.metadata
    })

    // Only process if payment is successful
    if (session.payment_status !== 'paid') {
      console.log('Payment not completed, skipping webhook processing')
      return
    }

    const userId = session.client_reference_id || session.metadata?.user_id
    const packageId = session.metadata?.package_id

    if (!userId || !packageId) {
      console.error('Missing user ID or package ID in webhook')
      return
    }

    // Check if this webhook has already been processed
    const { data: existingTransaction, error: checkError } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing transaction:', checkError)
      return
    }

    if (existingTransaction) {
      console.log('Webhook already processed:', session.id)
      return
    }

    // Find the wallet package
    const walletPackage = WALLET_PACKAGES.find(pkg => pkg.id === packageId)
    if (!walletPackage) {
      console.error('Invalid package ID in webhook:', packageId)
      return
    }

    // Calculate total amount (base + bonus)
    const totalAmount = calculateTotalAmount(packageId)

    console.log('Adding wallet balance via webhook:', {
      userId,
      packageId,
      totalAmount
    })

    // Get current user balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user in webhook:', userError)
      return
    }

    const currentBalance = userData.wallet_balance || 0
    const newBalance = currentBalance + totalAmount

    // Update user wallet balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating wallet balance in webhook:', updateError)
      return
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        amount: totalAmount,
        type: 'top_up',
        description: `Wallet top-up: ${walletPackage.label}${walletPackage.bonus ? ` (+${walletPackage.bonus} AED bonus)` : ''}`,
        stripe_session_id: session.id
      })

    if (transactionError) {
      console.error('Error creating transaction record in webhook:', transactionError)
      return
    }

    console.log('Wallet top-up processed successfully via webhook:', {
      userId,
      sessionId: session.id,
      amountAdded: totalAmount,
      newBalance
    })

  } catch (error: any) {
    console.error('Error processing wallet top-up webhook:', error)
  }
}