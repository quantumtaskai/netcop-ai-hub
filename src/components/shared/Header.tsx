'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import AuthModal from '@/components/AuthModal'
import ProfileModal from '@/components/ProfileModal'

interface HeaderProps {
  currentPage?: 'home' | 'marketplace' | 'pricing' | 'agent'
}

const Header: React.FC<HeaderProps> = ({ currentPage = 'home' }) => {
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
        className="header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '20px 24px',
          backdropFilter: 'blur(30px)',
          background: 'rgba(255, 255, 255, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <Link href="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              padding: '8px',
              borderRadius: '12px'
            }}>
              <img 
                src="/logo.png" 
                alt="Netcop Consultancy Logo"
                style={{
                  height: '80px',
                  width: 'auto'
                }}
              />
            </Link>
            
            <div style={{ display: 'flex', gap: '32px' }}>
              <Link 
                href="/" 
                style={{ 
                  color: currentPage === 'home' ? '#6366f1' : '#9ca3af', 
                  fontWeight: currentPage === 'home' ? '600' : '500', 
                  textDecoration: 'none' 
                }}
              >
                Home
              </Link>
              <Link 
                href="/marketplace" 
                style={{ 
                  color: currentPage === 'marketplace' ? '#6366f1' : '#9ca3af', 
                  fontWeight: currentPage === 'marketplace' ? '600' : '500', 
                  textDecoration: 'none' 
                }}
              >
                AI Marketplace
              </Link>
              <Link 
                href="/pricing" 
                style={{ 
                  color: currentPage === 'pricing' ? '#6366f1' : '#9ca3af', 
                  fontWeight: currentPage === 'pricing' ? '600' : '500', 
                  textDecoration: 'none' 
                }}
              >
                Pricing
              </Link>
            </div>
          </div>
          
          {/* User Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {user ? (
              <>
                {/* Credits Display */}
                <div 
                  onClick={() => router.push('/pricing')}
                  style={{
                    background: user.credits <= 100 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : user.credits <= 500
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: user.credits <= 100 
                      ? '0 4px 15px rgba(239, 68, 68, 0.3)'
                      : user.credits <= 500
                      ? '0 4px 15px rgba(245, 158, 11, 0.3)'
                      : '0 4px 15px rgba(16, 185, 129, 0.3)',
                    minWidth: '140px',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  💎 {user.credits} Credits
                </div>

                {/* User Profile */}
                <div
                  onClick={handleProfileClick}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '18px',
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
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
          onModeChange={setAuthMode}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && user && (
        <ProfileModal
          user={user}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
          position={dropdownPosition}
        />
      )}
    </>
  )
}

export default Header