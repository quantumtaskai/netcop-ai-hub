'use client'

import { useUserStore } from '@/store/userStore'
import { getAgentPrice } from '@/lib/agentPricing'
import { colors, gradients, spacing } from '@/lib/designSystem'
import { styleHelpers, cardStyles, textStyles, animationUtils } from '@/lib/styleUtils'

interface WalletBalanceProps {
  agentSlug: string
  onProcess: () => void
  disabled?: boolean
  processing?: boolean
}

export default function WalletBalance({ agentSlug, onProcess, disabled = false, processing = false }: WalletBalanceProps) {
  const { user } = useUserStore()

  if (!user) return null

  const agentPrice = getAgentPrice(agentSlug)
  if (!agentPrice) return null

  const balance = user.wallet_balance || 0
  const hasEnoughBalance = balance >= agentPrice.price
  const buttonDisabled = disabled || processing || !hasEnoughBalance

  return (
    <div style={{
      ...cardStyles.base,
      marginBottom: spacing.lg
    }}>
      <div style={{
        ...styleHelpers.flexBetween,
        marginBottom: spacing.md
      }}>
        <div>
          <h3 style={{
            ...textStyles.h4,
            marginBottom: spacing.xs
          }}>
            Cost
          </h3>
          <p style={{
            ...textStyles.small
          }}>
            This operation will cost {agentPrice.priceDisplay}
          </p>
        </div>
        
        <div style={{
          textAlign: 'right'
        }}>
          <div style={{
            background: hasEnoughBalance ? gradients.success : gradients.danger,
            color: colors.white,
            padding: `${spacing.xs} ${spacing.md}`,
            borderRadius: spacing.lg,
            fontSize: textStyles.body.fontSize,
            fontWeight: textStyles.h4.fontWeight,
            marginBottom: spacing.xs
          }}>
            💰 {balance.toFixed(2)} AED Available
          </div>
          {!hasEnoughBalance && (
            <p style={{
              color: colors.danger[500],
              fontSize: textStyles.small.fontSize,
              fontWeight: textStyles.small.fontWeight
            }}>
              Insufficient balance
            </p>
          )}
        </div>
      </div>

      <div style={{
        background: colors.gray[100],
        borderRadius: spacing.md,
        padding: spacing.sm,
        marginBottom: spacing.md
      }}>
        <div style={{
          ...styleHelpers.flexBetween,
          fontSize: textStyles.small.fontSize
        }}>
          <span style={{ color: colors.gray[500] }}>Current Balance:</span>
          <span style={{ fontWeight: textStyles.h4.fontWeight }}>{balance.toFixed(2)} AED</span>
        </div>
        <div style={{
          ...styleHelpers.flexBetween,
          fontSize: textStyles.small.fontSize,
          marginTop: spacing.xs
        }}>
          <span style={{ color: colors.gray[500] }}>Cost:</span>
          <span style={{ color: colors.danger[500], fontWeight: textStyles.h4.fontWeight }}>-{agentPrice.priceDisplay}</span>
        </div>
        <div style={{
          borderTop: `1px solid ${colors.gray[300]}`,
          marginTop: spacing.xs,
          paddingTop: spacing.xs,
          ...styleHelpers.flexBetween,
          fontSize: textStyles.small.fontSize
        }}>
          <span style={{ fontWeight: textStyles.h4.fontWeight }}>After Processing:</span>
          <span style={{ 
            fontWeight: textStyles.h4.fontWeight,
            color: hasEnoughBalance ? colors.success[600] : colors.danger[500]
          }}>
            {(balance - agentPrice.price).toFixed(2)} AED
          </span>
        </div>
      </div>

      <button
        onClick={onProcess}
        disabled={buttonDisabled}
        style={{
          width: '100%',
          ...styleHelpers.getButtonStyle(
            buttonDisabled ? 'disabled' : 'primary',
            buttonDisabled,
            processing
          )
        }}
        {...(!buttonDisabled ? animationUtils.scaleOnClick : {})}
      >
        {processing ? 'Processing...' : 
         !hasEnoughBalance ? 'Insufficient Balance' :
         `Process Agent (${agentPrice.priceDisplay})`}
      </button>

      {!hasEnoughBalance && (
        <p style={{
          textAlign: 'center',
          marginTop: spacing.sm,
          ...textStyles.small
        }}>
          <a href="/pricing" style={{ color: colors.primary[500], textDecoration: 'underline' }}>
            Top up wallet
          </a> to use this agent
        </p>
      )}
    </div>
  )
}