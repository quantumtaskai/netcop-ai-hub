'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import Header from '@/components/shared/Header'
import WalletStatus from '@/components/shared/WalletStatus'
import { WALLET_PACKAGES, formatWalletBalance, calculateTotalAmount } from '@/lib/walletUtils'
import { colors, spacing, typography } from '@/lib/designSystem'
import { cardStyles, textStyles, stylePatterns } from '@/lib/styleUtils'

function WalletForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, topUpWallet, refreshUser } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)

  // Handle payment success/failure
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')
    const packageId = searchParams.get('package')

    if (payment === 'success' && sessionId && packageId) {
      handlePaymentSuccess(sessionId, packageId)
    } else if (payment === 'cancelled') {
      toast.error('Payment was cancelled')
      router.replace('/wallet')
    } else if (payment === 'failed') {
      toast.error('Payment failed. Please try again.')
      router.replace('/wallet')
    }
  }, [searchParams, router])

  const handlePaymentSuccess = async (sessionId: string, packageId: string) => {
    try {
      setIsLoading(true)
      
      // Verify payment and update wallet
      const response = await fetch('/api/wallet/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, packageId })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Wallet topped up with ${formatWalletBalance(data.amount)}!`)
        await refreshUser()
      } else {
        toast.error('Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error('Failed to verify payment')
    } finally {
      setIsLoading(false)
      router.replace('/wallet')
    }
  }

  const handleTopUp = (packageId: string) => {
    if (isLoading) return
    setIsLoading(true)
    toast.success('Redirecting to payment...')
    topUpWallet(packageId)
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)' }}>
        <Header currentPage="wallet" />
        <div style={{ 
          ...stylePatterns.flexCenter, 
          minHeight: 'calc(100vh - 80px)',
          padding: spacing.lg 
        }}>
          <div style={{
            ...textStyles.h3,
            color: colors.gray[600]
          }}>
            Please login to access your wallet
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)' }}>
      <Toaster position="top-right" />
      <Header currentPage="wallet" />
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: spacing.lg,
        paddingTop: spacing['2xl']
      }}>
        {/* Page Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: spacing['2xl']
        }}>
          <h1 style={{
            ...textStyles.h1,
            marginBottom: spacing.md,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            💰 Wallet Management
          </h1>
          <p style={{
            ...textStyles.body,
            color: colors.gray[600],
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Add money to your wallet and use AI agents with simple AED pricing. No complex credit calculations needed.
          </p>
        </div>

        {/* Current Wallet Status */}
        <div style={{
          marginBottom: spacing['2xl']
        }}>
          <WalletStatus showAddButton={false} />
        </div>

        {/* Top-up Packages */}
        <div style={{
          ...cardStyles.elevated,
          marginBottom: spacing['2xl']
        }}>
          <h2 style={{
            ...textStyles.h3,
            marginBottom: spacing.lg,
            textAlign: 'center',
            color: colors.gray[800]
          }}>
            💳 Add Money to Wallet
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: spacing.lg,
            marginBottom: spacing.lg
          }}>
            {WALLET_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                style={{
                  ...cardStyles.interactive,
                  position: 'relative',
                  border: pkg.popular 
                    ? `2px solid ${colors.primary[400]}` 
                    : `1px solid ${colors.gray[200]}`,
                  background: pkg.popular 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)'
                    : colors.white,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => handleTopUp(pkg.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = cardStyles.elevated.boxShadow as string
                }}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: colors.white,
                    padding: `${spacing.xs} ${spacing.md}`,
                    borderRadius: spacing.lg,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                  }}>
                    ⭐ MOST POPULAR
                  </div>
                )}

                <div style={{ textAlign: 'center', paddingTop: pkg.popular ? spacing.md : 0 }}>
                  {/* Amount Display */}
                  <div style={{
                    fontSize: typography.fontSize['4xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: pkg.popular ? colors.primary[600] : colors.gray[800],
                    marginBottom: spacing.xs
                  }}>
                    {pkg.label}
                  </div>

                  {/* Bonus Display */}
                  {pkg.bonus && (
                    <div style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.success[600],
                      fontWeight: typography.fontWeight.semibold,
                      marginBottom: spacing.sm,
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: `${spacing.xs} ${spacing.sm}`,
                      borderRadius: spacing.md,
                      display: 'inline-block'
                    }}>
                      🎁 +{pkg.bonus} AED Bonus!
                    </div>
                  )}

                  {/* Total Amount */}
                  <div style={{
                    ...textStyles.body,
                    color: colors.gray[600],
                    marginBottom: spacing.md
                  }}>
                    {pkg.bonus ? (
                      <>
                        Pay {pkg.price} AED → Get {calculateTotalAmount(pkg.id)} AED
                      </>
                    ) : (
                      `Add ${pkg.amount} AED to your wallet`
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      background: pkg.popular 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: colors.white,
                      border: 'none',
                      borderRadius: spacing.lg,
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isLoading ? 0.7 : 1
                    }}
                  >
                    {isLoading ? 'Processing...' : `Add ${pkg.label}`}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Methods Info */}
          <div style={{
            textAlign: 'center',
            padding: spacing.lg,
            background: colors.gray[50],
            borderRadius: spacing.lg,
            border: `1px solid ${colors.gray[200]}`
          }}>
            <div style={{
              ...textStyles.body,
              color: colors.gray[600],
              marginBottom: spacing.sm
            }}>
              💳 Secure payment powered by Stripe
            </div>
            <div style={{
              ...textStyles.small,
              color: colors.gray[500]
            }}>
              Supports Visa, Mastercard, Apple Pay, Google Pay, and more
            </div>
          </div>
        </div>

        {/* Usage Info */}
        <div style={{
          ...cardStyles.base,
          background: 'rgba(59, 130, 246, 0.05)',
          border: `1px solid rgba(59, 130, 246, 0.2)`,
          textAlign: 'center'
        }}>
          <h3 style={{
            ...textStyles.h4,
            marginBottom: spacing.md,
            color: colors.primary[700]
          }}>
            🤖 How AI Agents Pricing Works
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.md,
            marginBottom: spacing.md
          }}>
            <div>
              <div style={{ ...textStyles.small, color: colors.gray[600] }}>Weather Report</div>
              <div style={{ ...textStyles.body, fontWeight: typography.fontWeight.semibold, color: colors.primary[600] }}>2.00 AED</div>
            </div>
            <div>
              <div style={{ ...textStyles.small, color: colors.gray[600] }}>Data Analysis</div>
              <div style={{ ...textStyles.body, fontWeight: typography.fontWeight.semibold, color: colors.primary[600] }}>5.00 AED</div>
            </div>
            <div>
              <div style={{ ...textStyles.small, color: colors.gray[600] }}>5 Whys Analysis</div>
              <div style={{ ...textStyles.body, fontWeight: typography.fontWeight.semibold, color: colors.primary[600] }}>8.00 AED</div>
            </div>
          </div>

          <div style={{
            ...textStyles.small,
            color: colors.gray[600]
          }}>
            Simple, transparent pricing. Pay exactly what you use, when you use it.
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: colors.primary[500], fontSize: typography.fontSize.lg }}>Loading wallet...</div>
      </div>
    }>
      <WalletForm />
    </Suspense>
  )
}