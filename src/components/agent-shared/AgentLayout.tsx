'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import Header from '@/components/shared/Header'
import { colors, gradients, spacing, typography, borderRadius, transitions } from '@/lib/designSystem'
import { stylePatterns, cardStyles, textStyles, buttonStyles, styleHelpers, animationUtils } from '@/lib/styleUtils'

interface AgentLayoutProps {
  children: ReactNode
  title: string
  description: string
  icon: string
  cost: number
}

export default function AgentLayout({ children, title, description, icon, cost }: AgentLayoutProps) {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      background: gradients.bgPrimary
    }}>
      {/* Shared Header */}
      <Header currentPage="agent" />
      
      {/* Agent Content */}
      <div style={{
        padding: spacing.md
      }}>
        <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: spacing.xl
      }}>
        <div style={{
          ...stylePatterns.flexBetween,
          marginBottom: spacing.lg,
          flexWrap: 'wrap',
          gap: spacing.sm
        }}>
          <button
            onClick={() => router.push('/marketplace')}
            style={{
              ...styleHelpers.getButtonStyle('secondary'),
              fontSize: typography.fontSize.base
            }}
            {...styleHelpers.createHoverHandler(
              { borderColor: colors.gray[200], color: colors.gray[700] },
              { borderColor: colors.primary[500], color: colors.primary[500] }
            )}
          >
            ← Back to Agents
          </button>

          {/* Credit display removed - now handled by shared Header component */}
        </div>

        {/* Agent Header */}
        <div style={{
          ...cardStyles.elevated
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.lg,
            marginBottom: spacing.md,
            flexWrap: 'wrap'
          }}>
            <div style={{
              fontSize: typography.fontSize['5xl'],
              background: gradients.primary,
              borderRadius: borderRadius.xl,
              width: '80px',
              height: '80px',
              ...stylePatterns.flexCenter,
              flexShrink: 0
            }}>
              {icon}
            </div>
            <div>
              <h1 style={{
                ...textStyles.h2,
                marginBottom: spacing.xs
              }}>
                {title}
              </h1>
              <p style={{
                ...textStyles.body,
                marginBottom: spacing.sm
              }}>
                {description}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                flexWrap: 'wrap'
              }}>
                <span style={{
                  background: gradients.success,
                  color: colors.white,
                  padding: `${spacing.xs} ${spacing.sm}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold
                }}>
                  {cost} Credits per use
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `0 ${spacing.md}`
      }}>
        {children}
      </div>
      
      {/* Mobile-specific styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          /* Ensure proper spacing on mobile */
          div[style*="display: grid"] {
            gap: 16px !important;
          }
          
          /* Stack elements vertically on mobile */
          div[style*="flexWrap: wrap"] {
            justify-content: center;
          }
          
          /* Better text alignment on mobile */
          h1, p {
            text-align: center;
          }
        }
        
        @media (max-width: 480px) {
          /* Very small screens */
          div[style*="background: rgba(255, 255, 255, 0.9)"] {
            margin: 0 8px;
          }
        }
      `}</style>
      </div>
    </div>
  )
}