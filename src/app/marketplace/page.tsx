'use client'

import { useState, useEffect, Suspense } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { AgentService } from '@/lib/agentService'
import { Agent } from '@/lib/supabase'
import { getAgentSlug } from '@/lib/agentUtils'
import AuthModal from '@/components/AuthModal'
import ProfileModal from '@/components/ProfileModal'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'

// Complete agent data matching your original design
const AGENTS = [
  {
    id: 1,
    name: 'Smart Customer Support Agent',
    description: 'Automates customer inquiries with intelligent responses, reducing response time by 80% while maintaining high satisfaction rates.',
    category: 'customer-service',
    cost: 25,
    rating: 4.9,
    reviews: 2300,
    initials: 'CS',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    name: 'Data Analysis Agent',
    description: 'Processes complex datasets and generates actionable insights with automated reporting and visualization capabilities.',
    category: 'analytics',
    cost: 45,
    rating: 4.8,
    reviews: 1800,
    initials: 'DA',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 3,
    name: 'Content Writing Agent',
    description: 'Creates high-quality, engaging content across multiple formats while maintaining brand voice and SEO optimization.',
    category: 'content',
    cost: 35,
    rating: 4.7,
    reviews: 3100,
    initials: 'CW',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 4,
    name: 'Email Automation Agent',
    description: 'Manages email campaigns with personalized content, smart scheduling, and performance tracking for maximum engagement.',
    category: 'email',
    cost: 30,
    rating: 4.9,
    reviews: 2700,
    initials: 'EA',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 5,
    name: 'Sales Assistant Agent',
    description: 'Qualifies leads, schedules meetings, and provides sales insights to accelerate your sales pipeline and close deals faster.',
    category: 'sales',
    cost: 40,
    rating: 4.6,
    reviews: 1900,
    initials: 'SA',
    gradient: 'from-rose-500 to-pink-600'
  },
  {
    id: 6,
    name: 'Task Automation Agent',
    description: 'Streamlines repetitive workflows across multiple platforms, saving hours of manual work with intelligent automation.',
    category: 'utilities',
    cost: 20,
    rating: 4.8,
    reviews: 4200,
    initials: 'TA',
    gradient: 'from-teal-500 to-cyan-600'
  },
  {
    id: 7,
    name: 'Weather Reporter Agent',
    description: 'Get detailed weather reports for any location worldwide with current conditions, forecasts, and weather alerts.',
    category: 'utilities',
    cost: 15,
    rating: 4.9,
    reviews: 1650,
    initials: 'WR',
    gradient: 'from-sky-400 to-blue-500'
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Agents', emoji: '🤖' },
  { id: 'customer-service', name: 'Customer Service', emoji: '💬' },
  { id: 'analytics', name: 'Analytics', emoji: '📊' },
  { id: 'content', name: 'Content', emoji: '📝' },
  { id: 'email', name: 'Email', emoji: '📧' },
  { id: 'utilities', name: 'Utilities', emoji: '🔧' },
  { id: 'sales', name: 'Sales', emoji: '💰' },
  { id: 'marketing', name: 'Marketing', emoji: '📈' }
]


function HomePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signOut, refreshUser } = useUserStore()
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login')
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [lastResult, setLastResult] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })


  // Handle payment success from Stripe redirect
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')

    if (payment === 'success') {
      toast.success('Payment successful! Credits have been added to your account.')
      if (user) {
        refreshUser()
      }
      // Redirect to pricing page
      router.replace('/pricing')
    }
  }, [searchParams, user, refreshUser, router])

  // Load agents (use hardcoded agents for now)
  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setIsLoading(true)
      // Use hardcoded agents instead of database for this demo
      setAgents(AGENTS as any)
    } catch (error) {
      console.error('Failed to load agents:', error)
      toast.error('Failed to load agents')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Logout handler  
  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }


  const useAgent = (agent: Agent) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (user.credits < agent.cost) {
      toast.error(`Insufficient credits! You need ${agent.cost} credits but only have ${user.credits}.`)
      router.push('/pricing')
      return
    }

    // Get agent slug and redirect to agent page
    const slug = getAgentSlug(agent.name)
    router.push(`/agent/${slug}?agentId=${agent.id}&cost=${agent.cost}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)',
      margin: 0,
      padding: 0,
      width: '100%',
      overflowX: 'hidden'
    }}>
      <Toaster position="top-right" />
      
      {/* Debug indicator */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        User: {user ? `${user.name} (${user.credits} credits)` : 'Not logged in'}
      </div>

      {/* Shared Header */}
      <Header currentPage="marketplace" />
      
      {/* Replace old nav with shared header - leaving for reference */}
      <nav style={{ display: 'none' }} disabled-old-nav={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '20px 24px',
        backdropFilter: 'blur(30px)',
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
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
                alt="Netcop AI Hub Logo"
                style={{
                  height: '60px',
                  width: 'auto'
                }}
                onError={(e) => {
                  // Fallback if logo image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.nextSibling) {
                    (target.nextSibling as HTMLElement).style.display = 'block';
                  }
                }}
              />
              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'none' // Hidden by default, shows if logo fails to load
              }}>
                Netcop AI Hub
              </div>
            </Link>
            <div style={{ display: 'flex', gap: '32px' }}>
              <Link href="/" style={{ color: '#9ca3af', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
              <span style={{ color: '#6366f1', fontWeight: '600' }}>AI Marketplace</span>
              <span style={{ color: '#9ca3af', fontWeight: '500' }}>Agents</span>
              <span style={{ color: '#9ca3af', fontWeight: '500' }}>Categories</span>
              <span 
                onClick={() => router.push('/pricing')}
                style={{ 
                  color: '#9ca3af', 
                  fontWeight: '500', 
                  cursor: 'pointer',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#6366f1'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#9ca3af'}
              >
                Pricing
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {user ? (
              <>
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
                    animation: user.credits <= 100 ? 'pulse 2s infinite' : 'none',
                    minWidth: '140px',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(-1px) scale(1.02)'
                    ;(e.target as HTMLElement).style.boxShadow = user.credits <= 100 
                      ? '0 6px 20px rgba(239, 68, 68, 0.4)'
                      : user.credits <= 500
                      ? '0 6px 20px rgba(245, 158, 11, 0.4)'
                      : '0 6px 20px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
                    ;(e.target as HTMLElement).style.boxShadow = user.credits <= 100 
                      ? '0 4px 15px rgba(239, 68, 68, 0.3)'
                      : user.credits <= 500
                      ? '0 4px 15px rgba(245, 158, 11, 0.3)'
                      : '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    <span>
                      {user.credits <= 100 ? '⚠️' : user.credits <= 500 ? '⚡' : '✨'}
                    </span>
                    <span>{user.credits.toLocaleString()} Credits</span>
                    <span style={{
                      fontSize: '22px',
                      fontWeight: '900',
                      marginLeft: '4px',
                      opacity: '0.8'
                    }}>
                      +
                    </span>
                  </div>
                </div>
                <div 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropdownPosition({
                      top: rect.bottom + 8,
                      right: window.innerWidth - rect.right
                    });
                    setShowProfileModal(true);
                  }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    background: showProfileModal ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!showProfileModal) {
                      (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)'
                      ;(e.target as HTMLElement).style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showProfileModal) {
                      (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)'
                      ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                    }
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>{user.name}</span>
                  <span style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    marginLeft: '4px'
                  }}>
                    ↓
                  </span>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: 'white',
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '32px 24px 64px', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Floating Elements */}
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '80px',
            width: '80px',
            height: '80px',
            background: 'rgba(147, 51, 234, 0.3)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '128px',
            width: '64px',
            height: '64px',
            background: 'rgba(59, 130, 246, 0.3)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '2s'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '80px',
            left: '33%',
            width: '48px',
            height: '48px',
            background: 'rgba(236, 72, 153, 0.3)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '4s'
          }}></div>

          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: 'bold',
            marginBottom: '32px',
            lineHeight: '1.1'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              AI Agents
            </span>
            <br />
            <span style={{ color: '#1f2937' }}>Ready to Use</span>
          </h1>

          {/* Search */}
          <div style={{ maxWidth: '512px', margin: '0 auto 64px auto' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search AI agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '20px 32px',
                  borderRadius: '24px',
                  fontSize: '18px',
                  border: 'none',
                  outline: 'none',
                  backdropFilter: 'blur(20px)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  color: '#000000'
                }}
              />
              <svg style={{
                position: 'absolute',
                right: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px',
                color: '#9ca3af'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          {/* Category Filters */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '64px'
          }}>
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '16px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  background: selectedCategory === category.id
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.7)',
                  color: selectedCategory === category.id ? 'white' : '#374151'
                }}
              >
                <span style={{ marginRight: '8px' }}>{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Grid Section */}
      <section style={{ padding: '0 24px 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          {/* Agents Grid */}
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                ⏳
              </div>
              <p>Loading AI agents...</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '32px'
            }}>
              {filteredAgents.map(agent => (
                <div
                  key={agent.id}
                  title=""
                  style={{
                    borderRadius: '24px',
                    padding: '32px',
                    backdropFilter: 'blur(30px)',
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '300px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-16px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 40px 80px rgba(0, 0, 0, 0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Agent Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div 
                      title=""
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${agent.gradient})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '20px'
                      }}>
                      {agent.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 
                        title=""
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          marginBottom: '4px',
                          lineHeight: '1.3',
                          wordWrap: 'break-word',
                          hyphens: 'auto',
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'clip'
                        }}>
                        {agent.name}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span title="" style={{ color: '#fbbf24' }}>⭐</span>
                        <span title="" style={{ color: '#6b7280', fontSize: '14px' }}>
                          {agent.rating} ({agent.reviews.toLocaleString()} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Agent Description */}
                  <p 
                    title=""
                    style={{
                      color: '#6b7280',
                      lineHeight: '1.5',
                      marginBottom: '24px',
                      fontSize: '14px',
                      flex: 1,
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                    {agent.description}
                  </p>

                  {/* Agent Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span title="" style={{ color: '#10b981', fontWeight: 'bold' }}>✨</span>
                      <span title="" style={{ color: '#1f2937', fontWeight: '600' }}>
                        {agent.cost} credits
                      </span>
                    </div>
                    <button
                      onClick={() => useAgent(agent)}
                      disabled={isProcessing === agent.id}
                      style={{
                        background: isProcessing === agent.id
                          ? '#9ca3af'
                          : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: '600',
                        cursor: isProcessing === agent.id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isProcessing === agent.id ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (isProcessing !== agent.id) {
                          (e.target as HTMLElement).style.transform = 'scale(1.05)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isProcessing !== agent.id) {
                          (e.target as HTMLElement).style.transform = 'scale(1)'
                        }
                      }}
                    >
                      {isProcessing === agent.id ? 'Processing...' : 'Use Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredAgents.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                🔍
              </div>
              <p>No agents found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        setAuthMode={setAuthMode}
      />

      {/* Result Modal */}
      {showResultModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowResultModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px'
            }}>
              Task Completed! 🎉
            </h2>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              whiteSpace: 'pre-line',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              {lastResult}
            </div>
          </div>
        </div>
      )}


      {/* Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={user.id}
          position={dropdownPosition}
        />
      )}

      {/* Shared Footer */}
      <Footer />
      
      {/* Replace old footer - leaving for reference */}
      <footer style={{ display: 'none' }} disabled-old-footer={{
        padding: '48px 24px',
        background: '#1f2937',
        margin: 0,
        width: '100%'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px',
            marginBottom: '32px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <img 
                  src="/logo-white.png" 
                  alt="NetCop AI Hub Logo"
                  style={{
                    height: '60px',
                    width: 'auto'
                  }}
                  onError={(e) => {
                    // Fallback if white logo image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextSibling) {
                      (target.nextSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div style={{
                  display: 'none', // Hidden by default, shows if logo fails to load
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px'
                  }}></div>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    NetCop AI Hub
                  </span>
                </div>
              </div>
              <p style={{ color: '#9ca3af' }}>
                The future of AI automation is here. Build, deploy, and scale AI agents for your business.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontWeight: '600',
                color: 'white',
                marginBottom: '16px'
              }}>
                Product
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Agents</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Marketplace</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Integrations</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>API</a>
              </div>
            </div>
            
            <div>
              <h4 style={{
                fontWeight: '600',
                color: 'white',
                marginBottom: '16px'
              }}>
                Company
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>About</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Blog</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Careers</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</a>
              </div>
            </div>
            
            <div>
              <h4 style={{
                fontWeight: '600',
                color: 'white',
                marginBottom: '16px'
              }}>
                Support
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Documentation</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Help Center</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Community</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Status</a>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p style={{ color: '#9ca3af' }}>© 2025 NetCop AI Hub. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          width: 100%;
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-30px) rotate(10deg); 
          }
        }
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Loading...
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}