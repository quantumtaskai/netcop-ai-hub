'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { toast } from 'react-hot-toast'
import { getAgentPrice } from '@/lib/agentPricing'
import { formatWalletBalance, getWalletStatus, hasSufficientBalance, getRecommendedTopUp, WALLET_PACKAGES } from '@/lib/walletUtils'
import { colors, spacing, typography } from '@/lib/designSystem'
import { stylePatterns, cardStyles, textStyles } from '@/lib/styleUtils'

interface WalletBalanceProps {
  agentSlug: string
  onUseAgent: () => void
  disabled?: boolean
  processing?: boolean
}

export default function WalletBalance({ agentSlug, onUseAgent, disabled = false, processing = false }: WalletBalanceProps) {
  const { user, topUpWallet } = useUserStore()
  const [showTopUpOptions, setShowTopUpOptions] = useState(false)

  if (!user) return null

  const agentPrice = getAgentPrice(agentSlug)
  if (!agentPrice) return null

  const balance = user.wallet_balance || 0
  const canAfford = hasSufficientBalance(balance, agentPrice.price)
  const walletStatus = getWalletStatus(balance)
  const recommendedTopUp = getRecommendedTopUp(balance, agentPrice.price)

  const handleUseAgent = () => {
    if (!canAfford) {
      toast.error(`Insufficient balance! You need ${agentPrice.priceDisplay} but only have ${formatWalletBalance(balance)}`)
      setShowTopUpOptions(true)
      return
    }

    if (processing) {
      toast.error('Please wait for the current operation to complete')
      return
    }

    onUseAgent()
  }

  const handleTopUp = (packageId: string) => {
    toast.success('Redirecting to payment...')
    topUpWallet(packageId)
    setShowTopUpOptions(false)
  }

  return (
    <div style={{
      ...cardStyles.elevated,
      position: 'sticky',
      top: spacing.lg,
      maxWidth: '400px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)'
    }}>
      {/* Wallet Balance Display */}
      <div style={{
        textAlign: 'center',
        marginBottom: spacing.lg
      }}>
        <div style={{
          ...textStyles.small,
          color: colors.gray[600],
          marginBottom: spacing.xs
        }}>
          💰 Wallet Balance
        </div>
        
        <div style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: walletStatus.color,
          marginBottom: spacing.xs
        }}>
          {formatWalletBalance(balance)}
        </div>

        <div style={{
          ...textStyles.small,
          color: walletStatus.color,
          fontStyle: 'italic'
        }}>
          {walletStatus.message}
        </div>
      </div>

      {/* Agent Cost Info */}
      <div style={{
        background: colors.gray[50],
        padding: spacing.md,
        borderRadius: spacing.md,
        marginBottom: spacing.lg,
        border: `1px solid ${colors.gray[200]}`
      }}>
        <div style={{
          ...stylePatterns.flexBetween,
          marginBottom: spacing.xs
        }}>
          <span style={{ ...textStyles.small, color: colors.gray[600] }}>
            {agentPrice.name}
          </span>
          <span style={{ ...textStyles.body, fontWeight: typography.fontWeight.semibold }}>
            {agentPrice.priceDisplay}
          </span>
        </div>
        
        <div style={{
          ...textStyles.small,
          color: colors.gray[500]
        }}>
          Estimated time: {agentPrice.estimatedTime}
        </div>
      </div>

      {/* Use Agent Button */}
      <button
        onClick={handleUseAgent}
        disabled={disabled || processing || !canAfford}
        style={{
          width: '100%',
          padding: spacing.md,
          borderRadius: spacing.lg,
          border: 'none',
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          cursor: disabled || processing || !canAfford ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs,
          background: canAfford && !disabled && !processing 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : colors.gray[300],
          color: canAfford && !disabled && !processing ? colors.white : colors.gray[500],
          opacity: disabled || processing ? 0.6 : 1,
          transform: processing ? 'scale(0.98)' : 'scale(1)'
        }}
        onMouseEnter={(e) => {
          if (canAfford && !disabled && !processing) {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)'
          }
        }}
        onMouseLeave={(e) => {
          if (canAfford && !disabled && !processing) {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)'
          }
        }}
      >
        {processing ? (
          <>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Processing...
          </>
        ) : canAfford ? (
          `Use ${agentPrice.name} - ${agentPrice.priceDisplay}`
        ) : (
          `Need ${agentPrice.priceDisplay} - Add Money`
        )}
      </button>

      {/* Low Balance Warning */}
      {walletStatus.status === 'low' && (
        <div style={{
          marginTop: spacing.md,
          padding: spacing.md,
          background: 'rgba(239, 68, 68, 0.1)',
          border: `1px solid rgba(239, 68, 68, 0.2)`,
          borderRadius: spacing.md,
          textAlign: 'center'
        }}>
          <div style={{
            ...textStyles.small,
            color: colors.danger[600],
            marginBottom: spacing.xs
          }}>
            ⚠️ Low Balance Warning
          </div>
          <div style={{
            ...textStyles.small,
            color: colors.gray[600]
          }}>
            Add money to continue using AI agents
          </div>
        </div>
      )}

      {/* Add Money Button */}
      <button
        onClick={() => setShowTopUpOptions(!showTopUpOptions)}
        style={{
          width: '100%',
          marginTop: spacing.md,
          padding: spacing.sm,
          background: colors.white,
          border: `2px solid ${colors.primary[200]}`,
          borderRadius: spacing.lg,
          color: colors.primary[600],
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.primary[50]
          e.currentTarget.style.borderColor = colors.primary[300]
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.white
          e.currentTarget.style.borderColor = colors.primary[200]
        }}
      >
        💳 Add Money to Wallet
      </button>

      {/* Top-up Options */}
      {showTopUpOptions && (
        <div style={{
          marginTop: spacing.md,
          padding: spacing.md,
          background: colors.gray[50],
          borderRadius: spacing.md,
          border: `1px solid ${colors.gray[200]}`
        }}>
          <div style={{
            ...textStyles.body,
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing.md,
            textAlign: 'center',
            color: colors.gray[700]
          }}>
            Choose Top-up Amount
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: spacing.sm
          }}>
            {WALLET_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleTopUp(pkg.id)}
                style={{
                  padding: spacing.sm,
                  background: pkg.popular ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : colors.white,
                  color: pkg.popular ? colors.white : colors.gray[700],
                  border: pkg.popular ? 'none' : `1px solid ${colors.gray[300]}`,
                  borderRadius: spacing.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!pkg.popular) {
                    e.currentTarget.style.background = colors.gray[100]
                    e.currentTarget.style.borderColor = colors.gray[400]
                  }
                }}
                onMouseLeave={(e) => {
                  if (!pkg.popular) {
                    e.currentTarget.style.background = colors.white
                    e.currentTarget.style.borderColor = colors.gray[300]
                  }
                }}
              >
                <div>{pkg.label}</div>
                {pkg.bonus && (
                  <div style={{
                    fontSize: typography.fontSize.xs,
                    opacity: 0.8,
                    marginTop: '2px'
                  }}>
                    +{pkg.bonus} AED bonus
                  </div>
                )}
                {pkg.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: colors.warning[500],
                    color: colors.white,
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontWeight: typography.fontWeight.bold
                  }}>
                    POPULAR
                  </div>
                )}
              </button>
            ))}
          </div>

          {recommendedTopUp && (
            <div style={{
              marginTop: spacing.md,
              padding: spacing.sm,
              background: 'rgba(16, 185, 129, 0.1)',
              border: `1px solid rgba(16, 185, 129, 0.2)`,
              borderRadius: spacing.md,
              textAlign: 'center'
            }}>
              <div style={{
                ...textStyles.small,
                color: colors.success[600]
              }}>
                💡 Recommended: {recommendedTopUp.label} for multiple uses
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Estimation */}
      {balance > 0 && (
        <div style={{
          marginTop: spacing.md,
          padding: spacing.sm,
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: spacing.md,
          textAlign: 'center'
        }}>
          <div style={{
            ...textStyles.small,
            color: colors.primary[600]
          }}>
            With current balance, you can use this agent{' '}
            <strong>{Math.floor(balance / agentPrice.price)} more time{Math.floor(balance / agentPrice.price) !== 1 ? 's' : ''}</strong>
          </div>
        </div>
      )}

      {/* CSS Animation for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}