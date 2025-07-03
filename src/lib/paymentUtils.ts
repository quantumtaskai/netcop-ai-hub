/**
 * Payment Utilities for Pay-per-Use System
 * 
 * Handles direct Stripe Checkout integration for individual agent payments
 */

import { AgentPrice } from './agentPricing'

export interface PaymentSession {
  sessionId: string
  agentSlug: string
  userId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

/**
 * Create Stripe Checkout session for agent payment
 */
export async function createAgentCheckoutSession(
  agentPrice: AgentPrice,
  userId: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<{ url: string; sessionId: string }> {
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL
  
  const defaultSuccessUrl = `${baseUrl}/agent/${agentPrice.slug}?session_id={CHECKOUT_SESSION_ID}&payment=success&execute=true`
  const defaultCancelUrl = `${baseUrl}/agent/${agentPrice.slug}?payment=cancelled`

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agentId: agentPrice.id,
      agentName: agentPrice.name,
      agentSlug: agentPrice.slug,
      price: agentPrice.price,
      currency: agentPrice.currency,
      userId,
      successUrl: successUrl || defaultSuccessUrl,
      cancelUrl: cancelUrl || defaultCancelUrl,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create checkout session')
  }

  const data = await response.json()
  return {
    url: data.url,
    sessionId: data.sessionId
  }
}

/**
 * Verify payment completion and get session details
 */
export async function verifyPaymentSession(sessionId: string): Promise<PaymentSession | null> {
  try {
    const response = await fetch(`/api/verify-payment?session_id=${sessionId}`)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.session
  } catch (error) {
    console.error('Failed to verify payment session:', error)
    return null
  }
}

/**
 * Handle successful payment and execute agent
 */
export async function handlePaymentSuccess(
  sessionId: string,
  agentSlug: string,
  executeCallback: () => Promise<void>
): Promise<boolean> {
  try {
    // Verify the payment was successful
    const session = await verifyPaymentSession(sessionId)
    
    if (!session || session.status !== 'completed') {
      throw new Error('Payment verification failed')
    }

    // Execute the agent
    await executeCallback()
    
    return true
  } catch (error) {
    console.error('Payment success handling failed:', error)
    return false
  }
}

/**
 * Format payment amount for Stripe (convert to cents)
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100) // Convert AED to fils (cents)
}

/**
 * Format amount for display (convert from Stripe cents)
 */
export function formatAmountFromStripe(amount: number, currency: string = 'AED'): string {
  const value = amount / 100
  return `${value.toFixed(2)} ${currency}`
}

/**
 * Generate unique order ID for tracking
 */
export function generateOrderId(agentSlug: string, userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${agentSlug}_${userId.slice(0, 8)}_${timestamp}_${random}`
}

/**
 * Payment URL helpers
 */
export const PaymentURLs = {
  success: (agentSlug: string, sessionId: string) => 
    `/agent/${agentSlug}?session_id=${sessionId}&payment=success&execute=true`,
  
  cancel: (agentSlug: string) => 
    `/agent/${agentSlug}?payment=cancelled`,
  
  failure: (agentSlug: string) => 
    `/agent/${agentSlug}?payment=failed`
}

/**
 * Payment status helpers
 */
export function getPaymentStatusFromURL(searchParams: URLSearchParams) {
  const payment = searchParams.get('payment')
  const sessionId = searchParams.get('session_id')
  const shouldExecute = searchParams.get('execute') === 'true'
  
  return {
    status: payment as 'success' | 'cancelled' | 'failed' | null,
    sessionId,
    shouldExecute: payment === 'success' && shouldExecute && sessionId
  }
}

/**
 * Pricing display helpers
 */
export function formatPriceDisplay(price: number, currency: string = 'AED'): string {
  return `${price.toFixed(2)} ${currency}`
}

export function getPriceComparisonText(price: number): string {
  if (price <= 3) return "Quick & Affordable"
  if (price <= 6) return "Great Value"
  return "Premium Analysis"
}

/**
 * Payment error handling
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message)
    this.name = 'PaymentError'
  }
}

export function handlePaymentError(error: any): PaymentError {
  if (error instanceof PaymentError) {
    return error
  }
  
  // Map common errors to user-friendly messages
  const errorMessage = error.message || 'Unknown error'
  
  if (errorMessage.includes('insufficient_funds')) {
    return new PaymentError(errorMessage, 'insufficient_funds', 'Insufficient funds. Please try a different payment method.')
  }
  
  if (errorMessage.includes('card_declined')) {
    return new PaymentError(errorMessage, 'card_declined', 'Your card was declined. Please try a different payment method.')
  }
  
  if (errorMessage.includes('network')) {
    return new PaymentError(errorMessage, 'network_error', 'Network error. Please check your connection and try again.')
  }
  
  return new PaymentError(errorMessage, 'unknown_error', 'Payment failed. Please try again or contact support.')
}