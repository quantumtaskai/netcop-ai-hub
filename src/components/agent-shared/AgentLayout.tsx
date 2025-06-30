'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import Header from '@/components/shared/Header'

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
      background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)'
    }}>
      {/* Shared Header */}
      <Header currentPage="agent" />
      
      {/* Agent Content */}
      <div style={{
        padding: 'clamp(12px, 3vw, 20px)'
      }}>
        <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: 'clamp(16px, 4vw, 32px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'clamp(12px, 3vw, 24px)',
          flexWrap: 'wrap',
          gap: 'clamp(8px, 2vw, 12px)'
        }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: 'clamp(8px, 2vw, 12px)',
              padding: 'clamp(10px, 3vw, 12px) clamp(16px, 4vw, 24px)',
              cursor: 'pointer',
              fontSize: 'clamp(12px, 3vw, 16px)',
              fontWeight: '500',
              color: '#374151',
              transition: 'all 0.2s ease',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement
              target.style.borderColor = '#3b82f6'
              target.style.color = '#3b82f6'
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement
              target.style.borderColor = '#e5e7eb'
              target.style.color = '#374151'
            }}
          >
            ← Back to Agents
          </button>

          {/* Credit display removed - now handled by shared Header component */}
        </div>

        {/* Agent Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 'clamp(16px, 4vw, 20px)',
          padding: 'clamp(16px, 4vw, 32px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(12px, 3vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            flexWrap: 'wrap'
          }}>
            <div style={{
              fontSize: 'clamp(32px, 8vw, 64px)',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: 'clamp(16px, 4vw, 20px)',
              width: 'clamp(50px, 12vw, 80px)',
              height: 'clamp(50px, 12vw, 80px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {icon}
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(20px, 5vw, 32px)',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: 'clamp(6px, 2vw, 8px)',
                lineHeight: '1.2'
              }}>
                {title}
              </h1>
              <p style={{
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                color: '#6b7280',
                marginBottom: 'clamp(8px, 2vw, 12px)',
                lineHeight: '1.4'
              }}>
                {description}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(6px, 2vw, 8px)',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
                  borderRadius: 'clamp(6px, 2vw, 8px)',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  fontWeight: '600'
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
        padding: '0 clamp(8px, 2vw, 16px)'
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