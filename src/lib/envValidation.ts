/**
 * Environment Variables Validation
 * Validates required environment variables and provides helpful error messages
 */

interface EnvConfig {
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string // Server-side only
  
  // Application
  NEXT_PUBLIC_APP_URL: string
  
  // External APIs
  NEXT_PUBLIC_OPENWEATHER_API_KEY?: string
  
  // Stripe (optional for basic functionality)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  
  // N8N Webhooks (optional - agents will gracefully handle missing)
  NEXT_PUBLIC_N8N_WEBHOOK_DATA_ANALYZER?: string
  NEXT_PUBLIC_N8N_WEBHOOK_FIVE_WHYS?: string
  NEXT_PUBLIC_N8N_WEBHOOK_JOB_POSTING?: string
  NEXT_PUBLIC_N8N_WEBHOOK_SOCIAL_ADS?: string
  NEXT_PUBLIC_N8N_WEBHOOK_FAQ_GENERATOR?: string
}

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL'
] as const

const optionalEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_OPENWEATHER_API_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_N8N_WEBHOOK_DATA_ANALYZER',
  'NEXT_PUBLIC_N8N_WEBHOOK_FIVE_WHYS',
  'NEXT_PUBLIC_N8N_WEBHOOK_JOB_POSTING',
  'NEXT_PUBLIC_N8N_WEBHOOK_SOCIAL_ADS',
  'NEXT_PUBLIC_N8N_WEBHOOK_FAQ_GENERATOR'
] as const

export function validateEnvironment(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
  config: Partial<EnvConfig>
} {
  const errors: string[] = []
  const warnings: string[] = []
  const config: Partial<EnvConfig> = {}

  // Check required variables
  for (const varName of requiredEnvVars) {
    const value = process.env[varName]
    if (!value || value.includes('placeholder') || value.includes('your_')) {
      errors.push(`Missing or invalid required environment variable: ${varName}`)
    } else {
      config[varName] = value
    }
  }

  // Check optional variables and provide warnings
  for (const varName of optionalEnvVars) {
    const value = process.env[varName]
    if (!value || value.includes('placeholder') || value.includes('your_')) {
      warnings.push(`Optional environment variable not configured: ${varName}`)
    } else {
      config[varName] = value
    }
  }

  // Specific validation checks
  if (config.NEXT_PUBLIC_SUPABASE_URL && !config.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL does not appear to be a valid Supabase URL')
  }

  if (config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY does not appear to be a valid Stripe publishable key')
  }

  if (config.STRIPE_SECRET_KEY && !config.STRIPE_SECRET_KEY.startsWith('sk_')) {
    errors.push('STRIPE_SECRET_KEY does not appear to be a valid Stripe secret key')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config: config as EnvConfig
  }
}

export function getSecureConfig(): EnvConfig {
  const validation = validateEnvironment()
  
  if (!validation.isValid) {
    console.error('❌ Environment validation failed:')
    validation.errors.forEach(error => console.error(`  - ${error}`))
    console.error('\n📝 Please check your .env.local file and ensure all required variables are set.')
    console.error('💡 See .env.example for the required format.')
    
    throw new Error('Environment validation failed. Check console for details.')
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:')
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  return validation.config as EnvConfig
}

// Client-side safe environment check
export function validateClientEnvironment() {
  const clientVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL'
  ]

  const missing = clientVars.filter(varName => 
    !process.env[varName] || 
    process.env[varName]!.includes('placeholder') ||
    process.env[varName]!.includes('your_')
  )

  if (missing.length > 0) {
    console.error('❌ Missing required client environment variables:', missing)
    return false
  }

  return true
}

// Security check for exposed credentials
export function checkForExposedCredentials() {
  const suspiciousPatterns = [
    /sk_live_/, // Live Stripe secret key
    /rk_live_/, // Live Stripe restricted key
    /supabase\.co.*service_role/, // Service role key pattern
  ]

  const clientEnvVars = Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
  
  for (const envVar of clientEnvVars) {
    const value = process.env[envVar] || ''
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        console.error(`🚨 SECURITY ALERT: Potentially sensitive data exposed in client environment variable: ${envVar}`)
        return false
      }
    }
  }

  return true
}