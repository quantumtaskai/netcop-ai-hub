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
        marginBottom: 'clamp(24px, 6vw, 32px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'clamp(16px, 4vw, 24px)'
        }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: 'clamp(10px, 3vw, 12px) clamp(16px, 4vw, 24px)',
              cursor: 'pointer',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              fontWeight: '500',
              color: '#374151',
              transition: 'all 0.2s ease'
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
          borderRadius: '20px',
          padding: 'clamp(20px, 5vw, 32px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(16px, 4vw, 24px)',
            marginBottom: 'clamp(12px, 3vw, 16px)'
          }}>
            <div style={{
              fontSize: 'clamp(48px, 12vw, 64px)',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '20px',
              width: 'clamp(60px, 15vw, 80px)',
              height: 'clamp(60px, 15vw, 80px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(24px, 6vw, 32px)',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                {title}
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#6b7280',
                marginBottom: '12px'
              }}>
                {description}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
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
        margin: '0 auto'
      }}>
        {children}
      </div>
      </div>
    </div>
  )
}