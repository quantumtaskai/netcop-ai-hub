'use client'

import { useState, useEffect, Suspense } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import AuthModal from '@/components/AuthModal'
import { WALLET_PACKAGES, calculateTotalAmount } from '@/lib/walletUtils'

function PricingForm() {
  const { user, topUpWallet, initializeSession } = useUserStore()
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login')

  // Initialize session on component mount
  useEffect(() => {
    initializeSession()
  }, [])

  // Allow public access to pricing page - no redirect needed

  const handlePurchase = (packageData: typeof WALLET_PACKAGES[0]) => {
    // Check if user is logged in before allowing purchase
    if (!user) {
      toast.error('Please sign in to add money to your wallet')
      setShowAuthModal(true)
      setAuthMode('login')
      return
    }

    setSelectedPackage(packageData.amount)
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
        
        /* Spinner animation for loading buttons */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Mobile optimizations for pricing page */
        @media (max-width: 768px) {
          /* Single column layout on mobile */
          div[style*="grid-template-columns: repeat(auto-fit"] {
            grid-template-columns: 1fr !important;
          }
          
          /* Ensure proper touch targets */
          button {
            min-height: 48px !important;
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
          
          /* Enhanced hover effects on mobile */
          button:active {
            transform: scale(0.98) !important;
          }
        }
        
        /* Hover effects for pricing cards */
        .pricing-card:hover {
          transform: scale(1.02) translateY(-2px) !important;
          box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.08) !important;
        }
        
        .pricing-card.popular:hover {
          box-shadow: 0 32px 64px -12px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.1) !important;
        }
        
        /* Hover effects for buttons */
        .pricing-button:hover:not(:disabled) {
          transform: scale(1.02) translateY(-1px) !important;
          box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.15) inset !important;
        }
        
        @media (max-width: 480px) {
          /* Extra small screens */
          div[style*="marginBottom: 'clamp"] {
            margin-bottom: 16px !important;
          }
          
          /* Smaller package icons on mobile */
          div[style*="fontSize: 'clamp(40px"] {
            font-size: clamp(32px, 8vw, 48px) !important;
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
        <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 6vw, 32px)', padding: '0 clamp(8px, 2vw, 16px)' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: 'clamp(8px, 2vw, 12px)',
            lineHeight: '1.3'
          }}>
            Wallet Top-up Packages
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            color: '#6b7280',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: '1.5',
            padding: '0 clamp(8px, 2vw, 16px)'
          }}>
            Add money to your wallet and use AI agents with simple AED pricing.
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
          {WALLET_PACKAGES.map((pkg, index) => {
            const packageIcons = ['💰', '⭐', '🚀', '👑']
            const packageColors = [
              { from: '#10b981', to: '#059669' }, // Green
              { from: '#3b82f6', to: '#1d4ed8' }, // Blue  
              { from: '#8b5cf6', to: '#7c3aed' }, // Purple
              { from: '#f59e0b', to: '#d97706' }  // Orange
            ]
            const currentColor = packageColors[index] || packageColors[0]
            
            return (
              <div
                key={pkg.id}
                className={`pricing-card ${pkg.popular ? 'popular' : ''}`}
                style={{
                  background: pkg.popular 
                    ? `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%), rgba(255, 255, 255, 0.95)`
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(15px)',
                  borderRadius: 'clamp(16px, 4vw, 24px)',
                  padding: 'clamp(20px, 5vw, 32px)',
                  border: pkg.popular 
                    ? '2px solid rgba(59, 130, 246, 0.3)' 
                    : '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: pkg.popular 
                    ? '0 25px 50px -12px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.05)' 
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  transform: selectedPackage === pkg.amount && isProcessing ? 'scale(0.98)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
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
                {/* Package Icon */}
                <div style={{
                  fontSize: 'clamp(40px, 10vw, 60px)',
                  marginBottom: 'clamp(8px, 2vw, 12px)',
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                }}>
                  {packageIcons[index]}
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
                {/* Enhanced Usage Examples */}
                <div style={{
                  background: 'rgba(59, 130, 246, 0.05)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  padding: 'clamp(12px, 3vw, 16px)',
                  border: '1px solid rgba(59, 130, 246, 0.1)'
                }}>
                  <div style={{
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    color: '#1f2937',
                    textAlign: 'center',
                    fontWeight: '600',
                    marginBottom: 'clamp(4px, 1vw, 6px)'
                  }}>
                    {pkg.amount <= 10 && '🎯 Perfect for trying AI agents'}
                    {pkg.amount > 10 && pkg.amount <= 50 && '⭐ Great for regular AI usage'}
                    {pkg.amount > 50 && pkg.amount <= 100 && '🚀 Ideal for power users'}
                    {pkg.amount > 100 && '👑 Perfect for teams & businesses'}
                  </div>
                  <div style={{
                    fontSize: 'clamp(11px, 2.5vw, 13px)',
                    color: '#6b7280',
                    textAlign: 'center',
                    lineHeight: '1.4'
                  }}>
                    {pkg.amount <= 10 && 'Test 2-5 different AI agents'}
                    {pkg.amount > 10 && pkg.amount <= 50 && '5-12 AI agent operations'}
                    {pkg.amount > 50 && pkg.amount <= 100 && '12-25 AI agent operations'}
                    {pkg.amount > 100 && 'Unlimited AI agent access'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePurchase(pkg)}
                disabled={isProcessing}
                className="pricing-button"
                style={{
                  width: '100%',
                  background: pkg.popular 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                    : `linear-gradient(135deg, ${currentColor.from} 0%, ${currentColor.to} 100%)`,
                  color: 'white',
                  padding: 'clamp(16px, 4vw, 18px) clamp(20px, 5vw, 24px)',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  fontWeight: '600',
                  border: 'none',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: isProcessing && selectedPackage === pkg.amount ? 0.7 : 1,
                  minHeight: '52px',
                  boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isProcessing && selectedPackage === pkg.amount ? 'Processing...' : `💳 Add ${pkg.label}`}
              </button>
            </div>
            )
          })}
        </div>


        {/* Value Proposition Section */}
        <div style={{
          marginTop: 'clamp(40px, 10vw, 80px)',
          textAlign: 'center',
          padding: '0 clamp(8px, 2vw, 16px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            borderRadius: 'clamp(16px, 4vw, 24px)',
            padding: 'clamp(24px, 6vw, 48px)',
            maxWidth: '800px',
            margin: '0 auto',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)'
          }}>
            <h3 style={{
              fontSize: 'clamp(20px, 5vw, 28px)',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: 'clamp(12px, 3vw, 16px)'
            }}>
              💡 Why Choose Our AI Agent System?
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
              gap: 'clamp(16px, 4vw, 24px)',
              marginTop: 'clamp(20px, 5vw, 32px)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(24px, 6vw, 32px)', marginBottom: 'clamp(8px, 2vw, 12px)' }}>⚡</div>
                <h4 style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: '600', color: '#1f2937', marginBottom: 'clamp(4px, 1vw, 6px)' }}>
                  Instant Results
                </h4>
                <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: '#6b7280', lineHeight: '1.4' }}>
                  Get AI-powered insights in seconds, not minutes
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(24px, 6vw, 32px)', marginBottom: 'clamp(8px, 2vw, 12px)' }}>🎯</div>
                <h4 style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: '600', color: '#1f2937', marginBottom: 'clamp(4px, 1vw, 6px)' }}>
                  Transparent Pricing
                </h4>
                <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: '#6b7280', lineHeight: '1.4' }}>
                  Simple AED pricing - no hidden fees or surprises
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(24px, 6vw, 32px)', marginBottom: 'clamp(8px, 2vw, 12px)' }}>🔄</div>
                <h4 style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: '600', color: '#1f2937', marginBottom: 'clamp(4px, 1vw, 6px)' }}>
                  No Expiration
                </h4>
                <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: '#6b7280', lineHeight: '1.4' }}>
                  Your wallet balance never expires - use it anytime
                </p>
              </div>
            </div>
          </div>
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
                How does AED pricing work?
              </h4>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: 'clamp(14px, 3.5vw, 16px)'
              }}>
                Each AI agent has a simple AED price. For example, the Data Analyzer costs 5.00 AED, while the Weather Reporter costs 2.00 AED. No complex calculations needed!
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: 'clamp(16px, 4vw, 18px)',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 'clamp(6px, 2vw, 8px)'
              }}>
                Does wallet balance expire?
              </h4>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: 'clamp(14px, 3.5vw, 16px)'
              }}>
                No! Your wallet balance never expires. Add money whenever you want and use it at your own pace. Perfect for occasional or regular AI usage.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: 'clamp(16px, 4vw, 18px)',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 'clamp(6px, 2vw, 8px)'
              }}>
                What about the bonus offer?
              </h4>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: 'clamp(14px, 3.5vw, 16px)'
              }}>
                The 100 AED package includes a 10 AED bonus! Pay 100 AED and get 110 AED in your wallet. Perfect for power users who want extra value.
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
                Absolutely! All payments are processed securely through Stripe with industry-standard encryption and PCI DSS compliance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

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