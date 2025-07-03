'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { formatWalletBalance, getWalletStatus } from '@/lib/walletUtils'
import { colors, spacing, typography } from '@/lib/designSystem'
import { textStyles } from '@/lib/styleUtils'

interface WalletStatusProps {
  showAddButton?: boolean
  compact?: boolean
}

export default function WalletStatus({ showAddButton = true, compact = false }: WalletStatusProps) {
  const { user } = useUserStore()
  const router = useRouter()

  if (!user) return null

  const balance = user.wallet_balance || 0
  const walletStatus = getWalletStatus(balance)

  const handleAddMoney = () => {
    router.push('/wallet')
  }

  if (compact) {
    return (
      <div 
        onClick={handleAddMoney}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
          padding: `${spacing.xs} ${spacing.sm}`,
          background: `linear-gradient(135deg, ${walletStatus.color}15 0%, ${walletStatus.color}10 100%)`,
          border: `1px solid ${walletStatus.color}30`,
          borderRadius: spacing.md,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minWidth: 'fit-content'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = `0 4px 12px ${walletStatus.color}20`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <span style={{ fontSize: '14px' }}>💰</span>
        <span style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: walletStatus.color
        }}>
          {formatWalletBalance(balance)}
        </span>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: spacing.lg,
      border: `1px solid ${colors.gray[200]}`,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Wallet Icon & Balance */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${walletStatus.color} 0%, ${walletStatus.color}80 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}>
          💰
        </div>
        
        <div>
          <div style={{
            ...textStyles.small,
            color: colors.gray[600],
            marginBottom: '2px'
          }}>
            Wallet Balance
          </div>
          <div style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            color: walletStatus.color
          }}>
            {formatWalletBalance(balance)}
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div style={{
        flex: 1,
        textAlign: 'center'
      }}>
        <div style={{
          ...textStyles.small,
          color: walletStatus.color,
          fontStyle: 'italic'
        }}>
          {walletStatus.message}
        </div>
      </div>

      {/* Add Money Button */}
      {showAddButton && (
        <button
          onClick={handleAddMoney}
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: colors.white,
            border: 'none',
            borderRadius: spacing.md,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minHeight: '36px',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          💳 Add Money
        </button>
      )}
    </div>
  )
}