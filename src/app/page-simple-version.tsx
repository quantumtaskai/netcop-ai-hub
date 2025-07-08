'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/store/userStore'
import AuthModal from '@/components/AuthModal'
import ProfileModal from '@/components/ProfileModal'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/designSystem'
import { stylePatterns, textStyles, cardStyles, animationUtils } from '@/lib/styleUtils'

interface ContactFormData {
  name: string
  email: string
  company: string
  message: string
}

const HomePage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    message: ''
  })

  const { user, initializeSession } = useUserStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Simple, clean initialization
  useEffect(() => {
    initializeSession()
    setIsLoaded(true)
  }, [])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your message! We will get back to you within 24 hours.')
    setFormData({ name: '', email: '', company: '', message: '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Smooth fade-in animation
  const pageStyle = {
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out'
  }

  return (
    <div style={pageStyle}>
      <Header currentPage="home" />
      
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        color: colors.white,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `0 ${spacing.lg}`,
          textAlign: 'center',
          zIndex: 2
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            fontWeight: typography.fontWeight.bold,
            marginBottom: spacing.lg,
            lineHeight: 1.2
          }}>
            AI Agents Marketplace
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            marginBottom: spacing.xl,
            opacity: 0.9,
            maxWidth: '800px',
            margin: `0 auto ${spacing.xl} auto`
          }}>
            Discover, deploy, and scale AI agents designed to automate your business processes
          </p>
          
          <div style={{
            display: 'flex',
            gap: spacing.lg,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link href="/marketplace" style={{
              ...cardStyles.base,
              background: colors.white,
              color: colors.primary[600],
              padding: `${spacing.md} ${spacing.xl}`,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = shadows['2xl']
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = shadows.lg
            }}>
              🤖 Explore AI Agents
            </Link>
            
            <Link href="/pricing" style={{
              ...cardStyles.base,
              background: 'transparent',
              color: colors.white,
              border: `2px solid ${colors.white}`,
              padding: `${spacing.md} ${spacing.xl}`,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.white
              e.currentTarget.style.color = colors.primary[600]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = colors.white
            }}>
              💰 View Pricing
            </Link>
          </div>
        </div>

        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 1
        }}>
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse'
          }} />
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: `${spacing['4xl']} ${spacing.lg}`,
        background: colors.gray[50]
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            ...textStyles.h2,
            marginBottom: spacing.xl
          }}>
            Why Choose Our AI Agents?
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing.xl,
            marginTop: spacing.xl
          }}>
            {[
              {
                icon: '⚡',
                title: 'Instant Results',
                description: 'Get AI-powered insights and automation in seconds'
              },
              {
                icon: '🎯',
                title: 'Transparent Pricing',
                description: 'Pay per use with clear AED pricing for each agent'
              },
              {
                icon: '🔄',
                title: 'No Expiration',
                description: 'Your wallet balance never expires, use when you need'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                ...cardStyles.base,
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: spacing.md
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  ...textStyles.h4,
                  marginBottom: spacing.sm
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  ...textStyles.body,
                  opacity: 0.8
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: `${spacing['4xl']} ${spacing.lg}`,
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: colors.white,
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            ...textStyles.h2,
            color: colors.white,
            marginBottom: spacing.lg
          }}>
            Ready to Automate Your Business?
          </h2>
          <p style={{
            ...textStyles.body,
            color: colors.white,
            fontSize: typography.fontSize.lg,
            marginBottom: spacing.xl,
            opacity: 0.9
          }}>
            Join thousands of businesses already using our AI agents to streamline their operations.
          </p>
          <Link href="/marketplace" style={{
            ...cardStyles.base,
            background: colors.white,
            color: colors.primary[600],
            padding: `${spacing.lg} ${spacing.xl}`,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}>
            🚀 Get Started Now
          </Link>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          setAuthMode={setAuthMode}
        />
      )}

      {showProfileModal && user && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={user.id}
        />
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}

export default HomePage