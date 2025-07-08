import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables for testing (avoid real services)
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NODE_ENV = 'test'

// Mock Stripe environment variables (prevent real Stripe calls)
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_testing'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_webhook_secret'

// Mock window.location for tests that need it
// Note: Some tests may need to mock location separately

// Mock sessionStorage and localStorage
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: mockStorage,
})

Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
})

// Mock fetch for API calls
global.fetch = jest.fn()

// Setup global test utilities
global.console = {
  ...console,
  // Suppress console logs in tests unless needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
  Toaster: jest.fn(() => null),
}))

// Mock Stripe (prevent real Stripe API calls)
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_mock_session',
            payment_status: 'paid',
            client_reference_id: 'user_123',
            amount_total: 1000,
          },
        },
      }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_mock_session',
          url: 'https://checkout.stripe.com/mock',
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: 'cs_test_mock_session',
          payment_status: 'paid',
          client_reference_id: 'user_123',
        }),
      },
    },
  }))
})

// Mock Supabase (prevent real database calls)
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn().mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' },
          session: { access_token: 'mock_token' },
        },
        error: null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' },
          session: { access_token: 'mock_token' },
        },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: { access_token: 'mock_token', user: { id: 'user_123' } },
        },
        error: null,
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user_123', email: 'test@example.com' } },
        error: null,
      }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'user_123', wallet_balance: 10.00 },
        error: null,
      }),
    })),
  })),
}))

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
  mockStorage.getItem.mockClear()
  mockStorage.setItem.mockClear()
  mockStorage.removeItem.mockClear()
  mockStorage.clear.mockClear()
})