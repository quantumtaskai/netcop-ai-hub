'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import AuthModal from '@/components/AuthModal'
import ProfileModal from '@/components/ProfileModal'
import { formatWalletBalance, getWalletStatus } from '@/lib/walletUtils'
import { colors, spacing, zIndex, transitions, typography } from '@/lib/designSystem'
import { textStyles, styleHelpers, animationUtils } from '@/lib/styleUtils'

interface HeaderProps {
  currentPage?: 'home' | 'marketplace' | 'pricing' | 'agent'
}

const Header: React.FC<HeaderProps> = ({ currentPage = 'home' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Add CSS for animations and responsive styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @media (max-width: 768px) {
        .desktop-nav { display: none !important; }
        .mobile-menu-button { display: block !important; }
      }
      @media (min-width: 769px) {
        .desktop-nav { display: flex !important; }
        .mobile-menu-button { display: none !important; }
        .mobile-menu { display: none !important; }
      }
    `
    document.head.appendChild(style)
    return () => {
      try {
        document.head.removeChild(style)
      } catch {
        // Style element may have already been removed
      }
    }
  }, [])

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element
        if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
          setIsMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])
  const router = useRouter()
  const { user, signOut } = useUserStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })

  const handleLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleProfileClick = (event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 10,
      right: window.innerWidth - rect.right
    })
    setShowProfileModal(true)
  }

  return (
    <>
      <header 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: zIndex.sticky,
          padding: isMobile ? `${spacing.xs} ${spacing.md}` : `${spacing.md} ${spacing.lg}`,
          backdropFilter: 'blur(30px)',
          background: 'rgba(255, 255, 255, 0.95)',
          borderBottom: `1px solid ${colors.gray[200]}`,
          transition: transitions.slow
        }}
      >
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo and Navigation */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? spacing.md : spacing['2xl']
          }}>
            <Link href="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: spacing.sm,
              textDecoration: 'none',
              transition: transitions.normal,
              padding: spacing.xs,
              borderRadius: spacing.lg
            }}>
              <img 
                src="/logo.png" 
                alt="Netcop Consultancy Logo"
                style={{
                  height: isMobile ? '40px' : '60px',
                  width: 'auto'
                }}
              />
            </Link>
            
            <div className="desktop-nav" style={{ display: 'flex', gap: spacing.xl }}>
              <Link 
                href="/" 
                style={{ 
                  color: currentPage === 'home' ? colors.primary[500] : colors.gray[400], 
                  fontWeight: currentPage === 'home' ? textStyles.h4.fontWeight : textStyles.body.fontWeight, 
                  textDecoration: 'none',
                  minWidth: '50px',
                  textAlign: 'center',
                  transition: transitions.colors
                }}
              >
                Home
              </Link>
              <Link 
                href="/marketplace" 
                style={{ 
                  color: currentPage === 'marketplace' ? colors.primary[500] : colors.gray[400], 
                  fontWeight: currentPage === 'marketplace' ? textStyles.h4.fontWeight : textStyles.body.fontWeight, 
                  textDecoration: 'none',
                  minWidth: '120px',
                  textAlign: 'center',
                  transition: transitions.colors
                }}
              >
                AI Marketplace
              </Link>
              <Link 
                href="/pricing" 
                style={{ 
                  color: currentPage === 'pricing' ? colors.primary[500] : colors.gray[400], 
                  fontWeight: currentPage === 'pricing' ? textStyles.h4.fontWeight : textStyles.body.fontWeight, 
                  textDecoration: 'none',
                  minWidth: '60px',
                  textAlign: 'center',
                  transition: transitions.colors
                }}
              >
                Pricing
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: spacing.sm,
                borderRadius: spacing.md,
                transition: transitions.colors,
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21M3 6H21M3 18H21" stroke={colors.gray[700]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          {/* User Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? spacing.xs : spacing.lg }}>
            {user ? (
              <>
                {/* Wallet Balance Display - Hidden on mobile */}
                {!isMobile && (() => {
                  const balance = user.wallet_balance || 0;
                  const walletStatus = getWalletStatus(balance);
                  return (
                    <div 
                    onClick={() => router.push('/pricing')}
                    style={{
                      background: `linear-gradient(135deg, ${walletStatus.color} 0%, ${walletStatus.color}90 100%)`,
                      color: colors.white,
                      padding: isMobile ? `${spacing.xs} ${spacing.sm}` : `${spacing.sm} ${spacing.md}`,
                      borderRadius: spacing.lg,
                      cursor: 'pointer',
                      transition: transitions.slow,
                      boxShadow: `0 4px 15px ${walletStatus.color}30`,
                      width: isMobile ? '140px' : '160px',
                      height: isMobile ? '32px' : '34px',
                      boxSizing: 'border-box',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: isMobile ? '12px' : '14px',
                      lineHeight: '14px',
                      animation: walletStatus.status === 'low' ? 'pulse 2s infinite' : 'none',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.transform = 'translateY(-1px) scale(1.02)';
                      (e.target as HTMLElement).style.boxShadow = `0 6px 20px ${walletStatus.color}40`;
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.transform = 'none';
                      (e.target as HTMLElement).style.boxShadow = `0 4px 15px ${walletStatus.color}30`;
                    }}
                  >
                      💰 {formatWalletBalance(balance)}
                    </div>
                  );
                })()}

                {/* User Profile */}
                <div
                  onClick={handleProfileClick}
                  style={{
                    width: isMobile ? '36px' : '44px',
                    height: isMobile ? '36px' : '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: isMobile ? '14px' : '18px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </>
            ) : (
              <button
                onClick={handleLogin}
                style={{
                  ...styleHelpers.getButtonStyle('primary'),
                  padding: isMobile ? `${spacing.sm} ${spacing.md}` : `${spacing.sm} ${spacing.lg}`,
                  fontSize: isMobile ? typography.fontSize.sm : typography.fontSize.base
                }}
                {...animationUtils.scaleOnClick}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          setAuthMode={setAuthMode}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && user && (
        <ProfileModal
          userId={user.id}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          position={dropdownPosition}
        />
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu"
          style={{
            position: 'fixed',
            top: isMobile ? '60px' : '76px',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderTop: 'none',
            padding: '16px 0',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            zIndex: 49
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            padding: '0 24px'
          }}>
            {/* User Info Section - Mobile Only */}
            {user && (
              <>
                <div style={{
                  padding: '16px',
                  background: 'rgba(99, 102, 241, 0.05)',
                  borderRadius: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>
                        {user.name || 'User'}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '14px' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  {(() => {
                    const balance = user.wallet_balance || 0;
                    const walletStatus = getWalletStatus(balance);
                    return (
                      <div 
                        onClick={() => {
                          router.push('/pricing')
                          setIsMobileMenuOpen(false)
                        }}
                        style={{
                          background: `linear-gradient(135deg, ${walletStatus.color} 0%, ${walletStatus.color}90 100%)`,
                          color: 'white',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          textAlign: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        💰 {formatWalletBalance(balance)}
                      </div>
                    );
                  })()}
                </div>
                <div style={{
                  height: '1px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  margin: '8px 0'
                }}></div>
              </>
            )}
            <Link 
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ 
                color: currentPage === 'home' ? '#6366f1' : '#374151', 
                fontWeight: currentPage === 'home' ? '600' : '500', 
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                background: currentPage === 'home' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              🏠 Home
            </Link>
            <Link 
              href="/marketplace"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ 
                color: currentPage === 'marketplace' ? '#6366f1' : '#374151', 
                fontWeight: currentPage === 'marketplace' ? '600' : '500', 
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                background: currentPage === 'marketplace' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              🤖 AI Marketplace
            </Link>
            <Link 
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ 
                color: currentPage === 'pricing' ? '#6366f1' : '#374151', 
                fontWeight: currentPage === 'pricing' ? '600' : '500', 
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                background: currentPage === 'pricing' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              💳 Pricing
            </Link>
            
            {/* User Actions - Mobile Only */}
            {user && (
              <>
                <div style={{
                  height: '1px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  margin: '8px 0'
                }}></div>
                <div
                  onClick={() => {
                    setShowProfileModal(true)
                    setIsMobileMenuOpen(false)
                  }}
                  style={{
                    color: '#374151',
                    fontWeight: '500',
                    textDecoration: 'none',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'transparent',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  👤 Profile Settings
                </div>
                <div
                  onClick={async () => {
                    await handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  style={{
                    color: '#ef4444',
                    fontWeight: '500',
                    textDecoration: 'none',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'transparent',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  🚪 Sign Out
                </div>
              </>
            )}
            
            {/* Auth Button for Non-logged in Users */}
            {!user && (
              <>
                <div style={{
                  height: '1px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  margin: '8px 0'
                }}></div>
                <div
                  onClick={() => {
                    handleLogin()
                    setIsMobileMenuOpen(false)
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: '600',
                    textDecoration: 'none',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  🔑 Sign In
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Header