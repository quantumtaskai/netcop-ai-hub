'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import Header from '@/components/shared/Header'
import AuthModal from '@/components/AuthModal'
import { WALLET_PACKAGES, formatWalletBalance, calculateTotalAmount } from '@/lib/walletUtils'

function PricingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refreshUser, topUpWallet, initializeSession } = useUserStore()
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login')

  // Initialize session on component mount
  useEffect(() => {
    initializeSession()
  }, [])

  // Allow public access to pricing page - no redirect needed

  const handlePurchase = (packageData: any) => {
    // Check if user is logged in before allowing purchase
    if (!user) {
      toast.error('Please sign in to add money to your wallet')
      setShowAuthModal(true)
      setAuthMode('login')
      return
    }

    setSelectedPackage(packageData.id)
    setIsProcessing(true)

    try {
      toast.success('Redirecting to Stripe payment...')
      
      // Use the topUpWallet function from userStore
      topUpWallet(packageData.id)
      
    } catch (error) {
      toast.error('Payment redirection failed. Please try again.')
    } finally {
      // Reset processing state after a short delay
      setTimeout(() => {
        setIsProcessing(false)
        setSelectedPackage(null)
      }, 1000)
    }
  }


  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
        
        /* Mobile optimizations for pricing page */
        @media (max-width: 768px) {
          /* Single column layout on mobile */
          div[style*="grid-template-columns: repeat(auto-fit"] {
            grid-template-columns: 1fr !important;
          }
          
          /* Ensure proper touch targets */
          button {
            min-height: 44px !important;
          }
          
          /* Better text wrapping */
          h1, h2, h3, h4, p {
            word-break: break-word;
          }
          
          /* Popular badge adjustments */
          div[style*="position: absolute"][style*="top: clamp"] {
            font-size: 12px !important;
            padding: 6px 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          /* Extra small screens */
          div[style*="marginBottom: 'clamp"] {
            margin-bottom: 16px !important;
          }
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)'
      }}>
        <Toaster position="top-right" />
      
      {/* Shared Header */}
      <Header currentPage="pricing" />

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(20px, 5vw, 32px) clamp(16px, 4vw, 24px) clamp(32px, 8vw, 48px)'
      }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 8vw, 48px)', padding: '0 clamp(8px, 2vw, 16px)' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 8vw, 48px)',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1.2'
          }}>
            💰 Wallet Top-up Packages
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
            padding: '0 clamp(8px, 2vw, 16px)'
          }}>
            Add money to your wallet and use AI agents with simple AED pricing. No complex credit calculations needed.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
          gap: 'clamp(16px, 4vw, 24px)',
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 clamp(8px, 2vw, 16px)'
        }}>
          {WALLET_PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'clamp(16px, 4vw, 20px)',
                padding: 'clamp(20px, 5vw, 32px)',
                border: pkg.popular ? '2px solid #3b82f6' : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: pkg.popular 
                  ? '0 20px 25px -5px rgba(59, 130, 246, 0.25)' 
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                transform: selectedPackage === pkg.id && isProcessing ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute',
                  top: 'clamp(-10px, -3vw, -12px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  padding: 'clamp(6px, 2vw, 8px) clamp(16px, 4vw, 24px)',
                  borderRadius: 'clamp(16px, 4vw, 20px)',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  whiteSpace: 'nowrap' as const
                }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 4vw, 24px)' }}>
                <div style={{
                  fontSize: 'clamp(32px, 8vw, 48px)',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: 'clamp(6px, 2vw, 8px)'
                }}>
                  {pkg.label}
                </div>
                <div style={{
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  color: '#6b7280',
                  marginBottom: 'clamp(12px, 3vw, 16px)'
                }}>
                  Wallet Balance
                </div>
                {pkg.bonus && (
                  <div style={{
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    color: '#10b981',
                    fontWeight: '600',
                    marginBottom: 'clamp(8px, 2vw, 12px)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
                    borderRadius: 'clamp(4px, 1vw, 6px)'
                  }}>
                    🎁 +{pkg.bonus} AED Bonus!
                  </div>
                )}
                <div style={{
                  fontSize: 'clamp(24px, 6vw, 32px)',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                  marginBottom: 'clamp(6px, 2vw, 8px)'
                }}>
                  {pkg.price} AED
                </div>
                <div style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  color: '#6b7280'
                }}>
                  {pkg.bonus ? `Pay ${pkg.price} AED → Get ${calculateTotalAmount(pkg.id)} AED` : `Add ${pkg.amount} AED to your wallet`}
                </div>
              </div>

              <div style={{ marginBottom: 'clamp(20px, 5vw, 32px)' }}>
                {/* Usage examples for wallet package */}
                <div style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  color: '#6b7280',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  {pkg.amount <= 10 && 'Perfect for trying AI agents'}
                  {pkg.amount > 10 && pkg.amount <= 50 && 'Great for regular AI usage'}
                  {pkg.amount > 50 && pkg.amount <= 100 && 'Ideal for power users'}
                  {pkg.amount > 100 && 'Perfect for teams & businesses'}
                </div>
              </div>

              <button
                onClick={() => handlePurchase(pkg)}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  background: pkg.popular 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                    : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  padding: 'clamp(14px, 4vw, 16px) clamp(20px, 5vw, 24px)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  fontWeight: '600',
                  border: 'none',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isProcessing && selectedPackage === pkg.id ? 0.7 : 1,
                  minHeight: '48px'
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    (e.target as HTMLElement).style.transform = 'scale(1.02)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) {
                    (e.target as HTMLElement).style.transform = 'scale(1)'
                  }
                }}
              >
                {isProcessing && selectedPackage === pkg.id
                  ? 'Processing...'
                  : `Add ${pkg.label}`
                }
              </button>
            </div>
          ))}
        </div>


        {/* FAQ Section */}
        <div style={{
          marginTop: 'clamp(40px, 10vw, 80px)',
          textAlign: 'center',
          padding: '0 clamp(8px, 2vw, 16px)'
        }}>
          <h3 style={{
            fontSize: 'clamp(24px, 6vw, 32px)',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 'clamp(24px, 6vw, 48px)'
          }}>
            Frequently Asked Questions
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
            gap: 'clamp(20px, 5vw, 32px)',
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'left'
          }}>
            <div>
              <h4 style={{
                fontSize: 'clamp(16px, 4vw, 18px)',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 'clamp(6px, 2vw, 8px)'
              }}>
                How do credits work?
              </h4>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: 'clamp(14px, 3.5vw, 16px)'
              }}>
                Each AI agent costs a certain number of credits to use. For example, the Data Analyzer costs 45 credits, while the Weather Reporter costs 15 credits.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: 'clamp(16px, 4vw, 18px)',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 'clamp(6px, 2vw, 8px)'
              }}>
                Do credits expire?
              </h4>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: 'clamp(14px, 3.5vw, 16px)'
              }}>
                Credits expire based on the package you choose. Basic packages last 30 days, while premium packages can last up to 6 months.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: 'clamp(16px, 4vw, 18px)',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 'clamp(6px, 2vw, 8px)'
              }}>
                Can I get a refund?
              </h4>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: 'clamp(14px, 3.5vw, 16px)'
              }}>
                We offer a 7-day money-back guarantee for all credit packages. Contact support if you're not satisfied with your purchase.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: 'clamp(16px, 4vw, 18px)',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 'clamp(6px, 2vw, 8px)'
              }}>
                Is payment secure?
              </h4>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: 'clamp(14px, 3.5vw, 16px)'
              }}>
                Yes! All payments are processed securely through Stripe with industry-standard encryption and security measures.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal for login before purchase */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          setAuthMode={setAuthMode}
        />
      )}
    </div>
    </>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)'
      }}>
        <div style={{
          fontSize: 'clamp(16px, 4vw, 18px)',
          color: '#6b7280'
        }}>
          Loading pricing...
        </div>
      </div>
    }>
      <PricingForm />
    </Suspense>
  )
}