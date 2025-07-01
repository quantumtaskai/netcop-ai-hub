'use client'

import { useUserStore } from '@/store/userStore'
import { colors, gradients, spacing } from '@/lib/designSystem'
import { styleHelpers, cardStyles, textStyles, animationUtils } from '@/lib/styleUtils'

interface CreditCounterProps {
  cost: number
  onProcess: () => void
  disabled?: boolean
  processing?: boolean
}

export default function CreditCounter({ cost, onProcess, disabled = false, processing = false }: CreditCounterProps) {
  const { user } = useUserStore()

  if (!user) return null

  const hasEnoughCredits = user.credits >= cost
  const buttonDisabled = disabled || processing || !hasEnoughCredits

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
            Credit Cost
          </h3>
          <p style={{
            ...textStyles.small
          }}>
            This operation will cost {cost} credits
          </p>
        </div>
        
        <div style={{
          textAlign: 'right'
        }}>
          <div style={{
            background: hasEnoughCredits ? gradients.success : gradients.danger,
            color: colors.white,
            padding: `${spacing.xs} ${spacing.md}`,
            borderRadius: spacing.lg,
            fontSize: textStyles.body.fontSize,
            fontWeight: textStyles.h4.fontWeight,
            marginBottom: spacing.xs
          }}>
            {user.credits.toLocaleString()} Credits Available
          </div>
          {!hasEnoughCredits && (
            <p style={{
              color: colors.danger[500],
              fontSize: textStyles.small.fontSize,
              fontWeight: textStyles.small.fontWeight
            }}>
              Insufficient credits
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
          <span style={{ fontWeight: textStyles.h4.fontWeight }}>{user.credits.toLocaleString()} credits</span>
        </div>
        <div style={{
          ...styleHelpers.flexBetween,
          fontSize: textStyles.small.fontSize,
          marginTop: spacing.xs
        }}>
          <span style={{ color: colors.gray[500] }}>Cost:</span>
          <span style={{ color: colors.danger[500], fontWeight: textStyles.h4.fontWeight }}>-{cost} credits</span>
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
            color: hasEnoughCredits ? colors.success[600] : colors.danger[500]
          }}>
            {(user.credits - cost).toLocaleString()} credits
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
         !hasEnoughCredits ? 'Insufficient Credits' :
         `Process Agent (${cost} credits)`}
      </button>

      {!hasEnoughCredits && (
        <p style={{
          textAlign: 'center',
          marginTop: spacing.sm,
          ...textStyles.small
        }}>
          <a href="/" style={{ color: colors.primary[500], textDecoration: 'underline' }}>
            Purchase more credits
          </a> to use this agent
        </p>
      )}
    </div>
  )
}