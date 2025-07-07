'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/shared/Header'
import { colors, spacing, typography, borderRadius } from '@/lib/designSystem'

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
          marginBottom: spacing.md,
          padding: `0 ${spacing.xs}`
        }}>
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            fontSize: typography.fontSize.sm,
            color: colors.gray[500]
          }}>
            <button
              onClick={() => router.push('/marketplace')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.gray[500],
                cursor: 'pointer',
                padding: spacing.xs,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                transition: transitions.colors,
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.primary[500]
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.gray[500]
                e.currentTarget.style.background = 'none'
              }}
            >
              Marketplace
            </button>
            <span style={{ color: colors.gray[300] }}>›</span>
            <span style={{ 
              color: colors.gray[700],
              fontWeight: typography.fontWeight.medium
            }}>
              {title}
            </span>
          </nav>
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