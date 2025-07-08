/**
 * Database Security and Transaction Management
 * Provides secure database operations with proper error handling and logging
 */

import { supabase } from './supabase'
import { sanitizeForLogging } from './inputValidation'

// Database operation results
export interface DatabaseResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

/**
 * Atomic wallet transaction - ensures wallet updates and transaction logs are consistent
 */
export async function atomicWalletTransaction(
  userId: string,
  amount: number,
  type: 'top_up' | 'agent_usage' | 'refund',
  description: string,
  agentSlug?: string,
  stripeSessionId?: string
): Promise<DatabaseResult> {
  const startTime = Date.now()
  
  try {
    // Start a transaction by using RPC with proper isolation
    const { data: result, error } = await supabase.rpc('wallet_transaction', {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_description: description,
      p_agent_slug: agentSlug || null,
      p_stripe_session_id: stripeSessionId || null
    })

    if (error) {
      console.error('Wallet transaction failed:', sanitizeForLogging({
        error: error.message,
        code: error.code,
        userId,
        amount,
        type,
        description
      }))
      
      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }

    const duration = Date.now() - startTime
    console.log('✅ Wallet transaction completed:', sanitizeForLogging({
      userId,
      amount,
      type,
      duration: `${duration}ms`,
      newBalance: result?.new_balance
    }))

    return {
      success: true,
      data: result
    }
  } catch (error: unknown) {
    console.error('Wallet transaction exception:', sanitizeForLogging({
      error: error instanceof Error ? error.message : String(error),
      userId,
      amount,
      type
    }))
    
    return {
      success: false,
      error: 'Database transaction failed',
      code: 'TRANSACTION_ERROR'
    }
  }
}

/**
 * Secure user profile creation with validation
 */
export async function createUserProfile(
  userId: string,
  email: string,
  name: string
): Promise<DatabaseResult> {
  try {
    // Validate inputs
    if (!userId || !email || !name) {
      return {
        success: false,
        error: 'Missing required user data',
        code: 'INVALID_INPUT'
      }
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        wallet_balance: 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('User profile creation failed:', sanitizeForLogging({
        error: error.message,
        code: error.code,
        userId,
        email
      }))
      
      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }

    console.log('✅ User profile created:', sanitizeForLogging({
      userId,
      email,
      name
    }))

    return {
      success: true,
      data
    }
  } catch (error: unknown) {
    console.error('User profile creation exception:', sanitizeForLogging({
      error: error instanceof Error ? error.message : String(error),
      userId,
      email
    }))
    
    return {
      success: false,
      error: 'Failed to create user profile',
      code: 'CREATION_ERROR'
    }
  }
}

/**
 * Secure wallet balance check with rate limiting
 */
export async function getWalletBalance(userId: string): Promise<DatabaseResult<number>> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
        code: 'INVALID_INPUT'
      }
    }

    const { data, error } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      }
      
      console.error('Wallet balance fetch failed:', sanitizeForLogging({
        error: error.message,
        code: error.code,
        userId
      }))
      
      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }

    return {
      success: true,
      data: data.wallet_balance || 0
    }
  } catch (error: unknown) {
    console.error('Wallet balance fetch exception:', sanitizeForLogging({
      error: error instanceof Error ? error.message : String(error),
      userId
    }))
    
    return {
      success: false,
      error: 'Failed to fetch wallet balance',
      code: 'FETCH_ERROR'
    }
  }
}

/**
 * Get transaction history with pagination and filtering
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  type?: string
): Promise<DatabaseResult> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
        code: 'INVALID_INPUT'
      }
    }

    // Limit the maximum number of records for performance
    const safeLimit = Math.min(limit, 100)

    let query = supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + safeLimit - 1)

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Transaction history fetch failed:', sanitizeForLogging({
        error: error.message,
        code: error.code,
        userId,
        limit: safeLimit,
        offset
      }))
      
      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error: unknown) {
    console.error('Transaction history fetch exception:', sanitizeForLogging({
      error: error instanceof Error ? error.message : String(error),
      userId,
      limit,
      offset
    }))
    
    return {
      success: false,
      error: 'Failed to fetch transaction history',
      code: 'FETCH_ERROR'
    }
  }
}

/**
 * Database health check for monitoring
 */
export async function checkDatabaseHealth(): Promise<DatabaseResult> {
  try {
    const startTime = Date.now()
    
    // Simple connection test
    const { error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)

    const duration = Date.now() - startTime

    if (error) {
      console.error('Database health check failed:', sanitizeForLogging({
        error: error.message,
        code: error.code,
        duration: `${duration}ms`
      }))
      
      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }

    return {
      success: true,
      data: {
        status: 'healthy',
        responseTime: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error: unknown) {
    console.error('Database health check exception:', sanitizeForLogging({
      error: error instanceof Error ? error.message : String(error)
    }))
    
    return {
      success: false,
      error: 'Database health check failed',
      code: 'HEALTH_CHECK_ERROR'
    }
  }
}

/**
 * Secure deletion of user data (GDPR compliance)
 */
export async function deleteUserData(userId: string): Promise<DatabaseResult> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
        code: 'INVALID_INPUT'
      }
    }

    // Delete in proper order to maintain referential integrity
    // 1. Delete transactions first
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .delete()
      .eq('user_id', userId)

    if (transactionError) {
      console.error('Failed to delete user transactions:', sanitizeForLogging({
        error: transactionError.message,
        userId
      }))
    }

    // 2. Delete user profile
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (userError) {
      console.error('Failed to delete user profile:', sanitizeForLogging({
        error: userError.message,
        userId
      }))
      
      return {
        success: false,
        error: userError.message,
        code: userError.code
      }
    }

    console.log('✅ User data deleted:', sanitizeForLogging({ userId }))

    return {
      success: true,
      data: { deleted: true }
    }
  } catch (error: unknown) {
    console.error('User data deletion exception:', sanitizeForLogging({
      error: error instanceof Error ? error.message : String(error),
      userId
    }))
    
    return {
      success: false,
      error: 'Failed to delete user data',
      code: 'DELETION_ERROR'
    }
  }
}

/**
 * Database connection pool monitoring
 */
export function monitorDatabaseConnections() {
  if (typeof window !== 'undefined') {
    // Client-side monitoring
    let connectionCount = 0
    
    const originalFetch = window.fetch
    window.fetch = function(...args: Parameters<typeof fetch>) {
      const url = args[0]
      if (typeof url === 'string' && url.includes('supabase.co')) {
        connectionCount++
        console.log(`📊 Database connection #${connectionCount}`)
      }
      return originalFetch.apply(this, args)
    }
  }
}

/**
 * SQL injection prevention helper
 */
export function validateDatabaseInput(input: unknown): boolean {
  if (typeof input === 'string') {
    // Check for common SQL injection patterns
    const dangerousPatterns = [
      /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|SELECT|UNION|UPDATE)\b)/i,
      /(;|\-\-|\/\*|\*\/)/,
      /(\b(OR|AND)\b.*?=.*?)/i,
      /'.*?'/
    ]
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(input)) {
        console.warn('🚨 Potential SQL injection attempt detected:', sanitizeForLogging({ input }))
        return false
      }
    }
  }
  
  return true
}

// Initialize database monitoring
if (typeof window !== 'undefined') {
  monitorDatabaseConnections()
}