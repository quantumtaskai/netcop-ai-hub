/**
 * Simple Wallet System Utilities
 * 
 * Manages user wallet balance in AED with simple top-up and usage tracking
 */

export interface WalletTransaction {
  id: string
  user_id: string
  amount: number           // AED amount (positive for top-up, negative for usage)
  type: 'top_up' | 'agent_usage' | 'refund'
  description: string
  agent_slug?: string
  stripe_session_id?: string
  created_at: string
}

export interface WalletTopUpPackage {
  id: string
  amount: number          // AED amount
  price: number           // Same as amount for simplicity
  label: string
  popular?: boolean
  bonus?: number          // Extra AED given (for promotions)
}

/**
 * Standard wallet top-up packages
 */
export const WALLET_PACKAGES: WalletTopUpPackage[] = [
  {
    id: 'wallet_10',
    amount: 10,
    price: 10,
    label: '10 AED',
    popular: false
  },
  {
    id: 'wallet_25',
    amount: 25,
    price: 25,
    label: '25 AED',
    popular: true
  },
  {
    id: 'wallet_50',
    amount: 50,
    price: 50,
    label: '50 AED',
    popular: false
  },
  {
    id: 'wallet_100',
    amount: 100,
    price: 100,
    label: '100 AED',
    popular: false,
    bonus: 10  // Get 110 AED for 100 AED payment
  }
]

/**
 * Check if user has sufficient wallet balance
 */
export function hasSufficientBalance(walletBalance: number, requiredAmount: number): boolean {
  return walletBalance >= requiredAmount
}

/**
 * Format wallet balance for display
 */
export function formatWalletBalance(balance: number): string {
  return `${balance.toFixed(2)} AED`
}

/**
 * Get wallet status (color coding for UI)
 */
export function getWalletStatus(balance: number): { 
  status: 'low' | 'medium' | 'high', 
  color: string,
  message: string 
} {
  if (balance < 5) {
    return {
      status: 'low',
      color: '#ef4444', // Red
      message: 'Low balance - Add money to continue using agents'
    }
  } else if (balance < 20) {
    return {
      status: 'medium', 
      color: '#f59e0b', // Orange
      message: 'Consider adding more funds'
    }
  } else {
    return {
      status: 'high',
      color: '#10b981', // Green
      message: 'Good balance'
    }
  }
}

/**
 * Calculate how many times user can use an agent
 */
export function calculateUsageCount(walletBalance: number, agentPrice: number): number {
  return Math.floor(walletBalance / agentPrice)
}

/**
 * Get recommended top-up amount based on usage pattern
 */
export function getRecommendedTopUp(currentBalance: number, agentPrice: number): WalletTopUpPackage | null {
  // If balance is insufficient for even one use
  if (currentBalance < agentPrice) {
    // Find smallest package that allows at least 3 uses
    const targetAmount = agentPrice * 3
    return WALLET_PACKAGES.find(pkg => pkg.amount >= targetAmount) || WALLET_PACKAGES[0]
  }
  
  // If balance is low (less than 2 uses)
  if (currentBalance < agentPrice * 2) {
    return WALLET_PACKAGES.find(pkg => pkg.popular) || WALLET_PACKAGES[1]
  }
  
  return null // No recommendation needed
}

/**
 * Create wallet transaction record
 */
export function createWalletTransaction(
  userId: string,
  amount: number,
  type: WalletTransaction['type'],
  description: string,
  agentSlug?: string,
  stripeSessionId?: string
): Omit<WalletTransaction, 'id' | 'created_at'> {
  return {
    user_id: userId,
    amount,
    type,
    description,
    agent_slug: agentSlug,
    stripe_session_id: stripeSessionId
  }
}

/**
 * Generate transaction descriptions
 */
export const TransactionDescriptions = {
  topUp: (amount: number) => `Wallet top-up: ${formatWalletBalance(amount)}`,
  agentUsage: (agentName: string, amount: number) => `Used ${agentName} (${formatWalletBalance(amount)})`,
  refund: (amount: number, reason: string) => `Refund: ${formatWalletBalance(amount)} - ${reason}`
}

/**
 * Wallet balance validation
 */
export function validateWalletBalance(balance: number): { isValid: boolean, error?: string } {
  if (balance < 0) {
    return { isValid: false, error: 'Wallet balance cannot be negative' }
  }
  
  if (balance > 1000) {
    return { isValid: false, error: 'Wallet balance cannot exceed 1000 AED' }
  }
  
  return { isValid: true }
}

/**
 * Get wallet package by ID
 */
export function getWalletPackage(packageId: string): WalletTopUpPackage | null {
  return WALLET_PACKAGES.find(pkg => pkg.id === packageId) || null
}

/**
 * Calculate total amount including bonus
 */
export function calculateTotalAmount(packageId: string): number {
  const pkg = getWalletPackage(packageId)
  if (!pkg) return 0
  
  return pkg.amount + (pkg.bonus || 0)
}

/**
 * Simple Stripe checkout URL generation for wallet top-up
 */
export function generateWalletTopUpURL(packageId: string, userId: string): string {
  const pkg = getWalletPackage(packageId)
  if (!pkg) throw new Error('Invalid package ID')
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL
  const successUrl = `${baseUrl}/wallet?session_id={CHECKOUT_SESSION_ID}&payment=success&package=${packageId}`
  const cancelUrl = `${baseUrl}/wallet?payment=cancelled`
  
  return `/api/wallet/create-checkout?package=${packageId}&user=${userId}&success=${encodeURIComponent(successUrl)}&cancel=${encodeURIComponent(cancelUrl)}`
}

/**
 * Transaction history helpers
 */
export function groupTransactionsByDate(transactions: WalletTransaction[]): Record<string, WalletTransaction[]> {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.created_at).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, WalletTransaction[]>)
}

export function calculateDailySpending(transactions: WalletTransaction[], days: number = 7): number[] {
  const now = new Date()
  const dailySpending: number[] = []
  
  for (let i = 0; i < days; i++) {
    const targetDate = new Date(now)
    targetDate.setDate(now.getDate() - i)
    const dateString = targetDate.toLocaleDateString()
    
    const daySpending = transactions
      .filter(t => t.type === 'agent_usage' && new Date(t.created_at).toLocaleDateString() === dateString)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    dailySpending.unshift(daySpending)
  }
  
  return dailySpending
}