/**
 * Input Validation and Sanitization
 * Comprehensive validation for all user inputs to prevent security vulnerabilities
 */

// File validation types
export interface FileValidation {
  allowedTypes: string[]
  maxSizeMB: number
  allowedExtensions: string[]
}

// Common file validation configs
export const FILE_VALIDATION_CONFIGS = {
  documents: {
    allowedTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSizeMB: 25,
    allowedExtensions: ['.pdf', '.txt', '.doc', '.docx', '.md']
  },
  data: {
    allowedTypes: ['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    maxSizeMB: 25,
    allowedExtensions: ['.pdf', '.csv', '.xls', '.xlsx']
  },
  images: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMB: 10,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
  }
} as const

/**
 * Validates file uploads
 */
export function validateFile(file: File, config: FileValidation): { isValid: boolean; error?: string } {
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > config.maxSizeMB) {
    return {
      isValid: false,
      error: `File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size of ${config.maxSizeMB}MB`
    }
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type '${file.type}' is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
    }
  }

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!config.allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File extension '${fileExtension}' is not allowed. Allowed extensions: ${config.allowedExtensions.join(', ')}`
    }
  }

  // Check for potentially malicious file names
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      isValid: false,
      error: 'File name contains invalid characters'
    }
  }

  return { isValid: true }
}

/**
 * Sanitizes text input to prevent XSS attacks
 */
export function sanitizeTextInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove HTML tags and encode special characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/[<>&"']/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      }
      return escapeMap[match]
    })
    .trim()
}

/**
 * Validates and sanitizes email addresses
 */
export function validateEmail(email: string): { isValid: boolean; email?: string; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' }
  }

  const sanitizedEmail = email.trim().toLowerCase()
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  if (sanitizedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long' }
  }

  return { isValid: true, email: sanitizedEmail }
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { isValid: boolean; score: number; error?: string; suggestions: string[] } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, score: 0, error: 'Password is required', suggestions: [] }
  }

  const suggestions: string[] = []
  let score = 0

  // Length check
  if (password.length < 8) {
    suggestions.push('Use at least 8 characters')
  } else {
    score += 1
  }

  // Complexity checks
  if (!/[a-z]/.test(password)) {
    suggestions.push('Include lowercase letters')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    suggestions.push('Include uppercase letters')
  } else {
    score += 1
  }

  if (!/[0-9]/.test(password)) {
    suggestions.push('Include numbers')
  } else {
    score += 1
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    suggestions.push('Include special characters (!@#$%^&*)')
  } else {
    score += 1
  }

  // Check for common weak patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /111111/,
    /admin/i
  ]

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      suggestions.push('Avoid common password patterns')
      score = Math.max(0, score - 1)
      break
    }
  }

  const isValid = score >= 3 && password.length >= 8

  return {
    isValid,
    score,
    error: isValid ? undefined : 'Password does not meet security requirements',
    suggestions
  }
}

/**
 * Validates and sanitizes user names
 */
export function validateName(name: string): { isValid: boolean; name?: string; error?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' }
  }

  const sanitizedName = sanitizeTextInput(name)
  
  if (sanitizedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' }
  }

  if (sanitizedName.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' }
  }

  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(sanitizedName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
  }

  return { isValid: true, name: sanitizedName }
}

/**
 * Rate limiting helper for API calls
 */
export class RateLimit {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()

  check(identifier: string, maxAttempts: number, windowMinutes: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const windowMs = windowMinutes * 60 * 1000
    
    const current = this.attempts.get(identifier)
    
    if (!current || now > current.resetTime) {
      // First attempt or window expired
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs })
      return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs }
    }
    
    if (current.count >= maxAttempts) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: current.resetTime }
    }
    
    // Increment attempt count
    current.count++
    this.attempts.set(identifier, current)
    
    return { allowed: true, remaining: maxAttempts - current.count, resetTime: current.resetTime }
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

/**
 * Content security policy helpers
 */
export function validateWebhookUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' }
  }

  try {
    const parsedUrl = new URL(url)
    
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:') {
      return { isValid: false, error: 'Only HTTPS URLs are allowed in production' }
    }

    // Allow localhost for development
    if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
      if (process.env.NODE_ENV === 'production') {
        return { isValid: false, error: 'Localhost URLs are not allowed in production' }
      }
      return { isValid: true }
    }

    // Validate allowed domains (you can customize this list)
    const allowedDomains = [
      'n8n.cloud',
      'quantumtaskai.app.n8n.cloud',
      'webhook.site' // For testing only
    ]

    const isAllowedDomain = allowedDomains.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    )

    if (!isAllowedDomain) {
      return { isValid: false, error: `Domain '${parsedUrl.hostname}' is not in the allowed list` }
    }

    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' }
  }
}

/**
 * Sanitize object for logging (remove sensitive data)
 */
export function sanitizeForLogging(obj: any): any {
  const sensitiveKeys = ['password', 'token', 'key', 'secret', 'credential']
  
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item))
  }

  const sanitized: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeForLogging(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

// Global rate limiter instances
export const authRateLimit = new RateLimit()
export const apiRateLimit = new RateLimit()
export const webhookRateLimit = new RateLimit()