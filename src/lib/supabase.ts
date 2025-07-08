import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration with fallbacks for build process
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                       'placeholder_anon_key_for_build'

// Only show configuration in development
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Supabase Configuration:')
  console.log('URL:', supabaseUrl)
  console.log('Key exists:', !!supabaseAnonKey)
  console.log('Key length:', supabaseAnonKey?.length)
}

// Warn about missing configuration but don't block build
if ((!supabaseUrl.includes('supabase.co') || supabaseAnonKey.includes('placeholder')) && 
    typeof window !== 'undefined' && 
    process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ Supabase environment variables not configured properly!')
  console.warn('Please check your .env.local file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test the connection (client-side only, not during build)
if (typeof window !== 'undefined' && !supabaseAnonKey.includes('placeholder')) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Supabase connection test:', { data, error })
    }
  }).catch(error => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase connection test failed:', error.message)
    }
  })
}

// Database types
export interface User {
  id: string
  email: string
  name: string
  wallet_balance: number
  created_at: string
  updated_at: string
}

export interface Agent {
  id: number
  name: string
  description: string
  category: string
  rating: number
  reviews: number
  initials: string
  gradient: string
  slug: string
  is_active: boolean
  created_at: string
}

export interface UsageHistory {
  id: string
  user_id: string
  agent_id: number
  agent_name: string
  cost: number
  result: string
  status: 'completed' | 'processing' | 'failed'
  created_at: string
}

export interface WalletTransaction {
  id: string
  user_id: string
  amount: number
  type: 'top_up' | 'agent_usage' | 'refund'
  description: string
  agent_slug?: string
  stripe_session_id?: string
  created_at: string
} 