import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { WALLET_PACKAGES } from '@/lib/walletUtils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('package')
    const userId = searchParams.get('user')
    const successUrl = searchParams.get('success')
    const cancelUrl = searchParams.get('cancel')

    if (!packageId || !userId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
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

    console.log('Creating wallet checkout session:', {
      packageId,
      userId,
      amount: walletPackage.price,
      currency: 'AED'
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: `Wallet Top-up - ${walletPackage.label}`,
              description: `Add ${walletPackage.label} to your wallet balance`,
            },
            unit_amount: Math.round(walletPackage.price * 100), // Convert to fils (cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        package_id: packageId,
        user_id: userId,
        wallet_amount: walletPackage.amount.toString(),
        bonus_amount: walletPackage.bonus?.toString() || '0',
        type: 'wallet_topup'
      },
      client_reference_id: userId,
    })

    console.log('Checkout session created:', {
      sessionId: session.id,
      url: session.url
    })

    // Redirect to Stripe checkout
    return NextResponse.redirect(session.url!)
  } catch (error: unknown) {
    console.error('Wallet checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}