'use client'

import { useState, useEffect, Suspense } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { AgentService } from '@/lib/agentService'
import { Agent } from '@/lib/supabase'
import { getAgentSlug } from '@/lib/agentUtils'
import { getAgentPrice } from '@/lib/agentPricing'
import AuthModal from '@/components/AuthModal'
import ProfileModal from '@/components/ProfileModal'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'

// ✅ WORKING AGENTS FIRST - Fully implemented with working pages
const AGENTS = [
  {
    id: 1,
    name: '5 Whys Analysis Agent',
    description: 'Systematic root cause analysis using the proven 5 Whys methodology to identify and solve business problems effectively.',
    category: 'analytics',
    rating: 4.8,
    reviews: 850,
    initials: '5W',
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    id: 2,
    name: 'Data Analysis Agent',
    description: 'Processes complex datasets and generates actionable insights with automated reporting and visualization capabilities.',
    category: 'analytics',
    rating: 4.8,
    reviews: 1800,
    initials: 'DA',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 3,
    name: 'Weather Reporter Agent',
    description: 'Get detailed weather reports for any location worldwide with current conditions, forecasts, and weather alerts.',
    category: 'utilities',
    rating: 4.9,
    reviews: 1650,
    initials: 'WR',
    gradient: 'from-sky-400 to-blue-500'
  },
  {
    id: 9,
    name: 'Job Posting Generator Agent',
    description: 'Create compelling, professional job postings with AI-powered content generation. Generate structured job descriptions, requirements, and application instructions.',
    category: 'content',
    rating: 4.7,
    reviews: 1200,
    initials: 'JP',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 10,
    name: 'Social Ads Generator Agent',
    description: 'Create engaging social media advertisements optimized for different platforms. Generate compelling ad copy with platform-specific formatting and emoji support.',
    category: 'marketing',
    rating: 4.8,
    reviews: 950,
    initials: 'SA',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 11,
    name: 'FAQ Generator Agent',
    description: 'Generate comprehensive FAQs from uploaded files or website URLs. Automatically extracts key information and creates professional question-answer pairs.',
    category: 'content',
    rating: 4.7,
    reviews: 750,
    initials: 'FQ',
    gradient: 'from-purple-500 to-indigo-600'
  },
  
  // 🚧 COMING SOON - Not yet implemented (no working pages)
  {
    id: 4,
    name: 'Smart Customer Support Agent',
    description: 'Automates customer inquiries with intelligent responses, reducing response time by 80% while maintaining high satisfaction rates.',
    category: 'customer-service',
    rating: 4.9,
    reviews: 2300,
    initials: 'CS',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 5,
    name: 'Content Writing Agent',
    description: 'Creates high-quality, engaging content across multiple formats while maintaining brand voice and SEO optimization.',
    category: 'content',
    rating: 4.7,
    reviews: 3100,
    initials: 'CW',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 6,
    name: 'Email Automation Agent',
    description: 'Manages email campaigns with personalized content, smart scheduling, and performance tracking for maximum engagement.',
    category: 'email',
    rating: 4.9,
    reviews: 2700,
    initials: 'EA',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 7,
    name: 'Sales Assistant Agent',
    description: 'Qualifies leads, schedules meetings, and provides sales insights to accelerate your sales pipeline and close deals faster.',
    category: 'sales',
    rating: 4.6,
    reviews: 1900,
    initials: 'SA',
    gradient: 'from-rose-500 to-pink-600'
  },
  {
    id: 8,
    name: 'Task Automation Agent',
    description: 'Streamlines repetitive workflows across multiple platforms, saving hours of manual work with intelligent automation.',
    category: 'utilities',
    rating: 4.8,
    reviews: 4200,
    initials: 'TA',
    gradient: 'from-teal-500 to-cyan-600'
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Assistants', emoji: '🤖' },
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
      toast.success('Payment successful! Money has been added to your wallet.')
      if (user) {
        refreshUser()
      }
      // Redirect to wallet page
      router.replace('/wallet')
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


  const handleAgentClick = (agent: Agent) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // Get agent pricing from our pricing system
    const slug = getAgentSlug(agent.name)
    const agentPrice = getAgentPrice(slug)
    
    if (!agentPrice) {
      toast.error('Agent pricing not found')
      return
    }

    const balance = user.wallet_balance || 0
    if (balance < agentPrice.price) {
      toast.error(`Insufficient balance! You need ${agentPrice.priceDisplay} but only have ${balance.toFixed(2)} AED.`)
      router.push('/wallet')
      return
    }

    // Redirect to agent page
    router.push(`/agent/${slug}`)
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
        User: {user ? `${user.name} (${(user.wallet_balance || 0).toFixed(2)} AED)` : 'Not logged in'}
      </div>

      {/* Shared Header */}
      <Header currentPage="marketplace" />
      
      {/* Old navigation removed - now using shared Header component */}

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 24px) clamp(30px, 8vw, 50px)', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center', position: 'relative', padding: '0 clamp(8px, 2vw, 16px)' }}>
          {/* Floating Elements - Responsive */}
          <div style={{
            position: 'absolute',
            top: 'clamp(20px, 5vw, 40px)',
            left: 'clamp(5%, 10%, 15%)',
            width: 'clamp(40px, 10vw, 80px)',
            height: 'clamp(40px, 10vw, 80px)',
            background: 'rgba(147, 51, 234, 0.3)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite',
            display: window.innerWidth > 480 ? 'block' : 'none'
          }}></div>
          <div style={{
            position: 'absolute',
            top: 'clamp(40px, 8vw, 80px)',
            right: 'clamp(5%, 15%, 20%)',
            width: 'clamp(32px, 8vw, 64px)',
            height: 'clamp(32px, 8vw, 64px)',
            background: 'rgba(59, 130, 246, 0.3)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '2s',
            display: window.innerWidth > 480 ? 'block' : 'none'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 'clamp(40px, 10vw, 80px)',
            left: 'clamp(20%, 30%, 40%)',
            width: 'clamp(24px, 6vw, 48px)',
            height: 'clamp(24px, 6vw, 48px)',
            background: 'rgba(236, 72, 153, 0.3)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '4s',
            display: window.innerWidth > 480 ? 'block' : 'none'
          }}></div>

          <h1 style={{
            fontSize: 'clamp(32px, 8vw, 96px)',
            fontWeight: 'bold',
            marginBottom: 'clamp(24px, 6vw, 32px)',
            lineHeight: '1.1'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              AI Assistants
            </span>
            <br />
            <span style={{ color: '#1f2937' }}>Ready to Use</span>
          </h1>

          {/* Search */}
          <div style={{ maxWidth: '512px', margin: '0 auto clamp(20px, 5vw, 40px) auto', padding: '0 clamp(8px, 2vw, 16px)' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search AI assistants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'clamp(14px, 4vw, 20px) clamp(20px, 5vw, 32px)',
                  borderRadius: 'clamp(16px, 4vw, 24px)',
                  fontSize: 'clamp(14px, 3.5vw, 18px)',
                  border: 'none',
                  outline: 'none',
                  backdropFilter: 'blur(20px)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  color: '#000000',
                  minHeight: '48px'
                }}
              />
              <svg style={{
                position: 'absolute',
                right: 'clamp(16px, 4vw, 24px)',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 'clamp(20px, 5vw, 24px)',
                height: 'clamp(20px, 5vw, 24px)',
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
            gap: 'clamp(8px, 2vw, 16px)',
            marginBottom: 'clamp(16px, 4vw, 32px)',
            padding: '0 clamp(8px, 2vw, 16px)'
          }}>
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: 'clamp(10px, 3vw, 12px) clamp(16px, 4vw, 24px)',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  background: selectedCategory === category.id
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.7)',
                  color: selectedCategory === category.id ? 'white' : '#374151',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ marginRight: '8px' }}>{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Assistants Grid Section */}
      <section style={{ padding: '0 clamp(16px, 4vw, 24px) clamp(40px, 10vw, 80px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          {/* Assistants Grid */}
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: 'clamp(40px, 10vw, 60px) clamp(16px, 4vw, 20px)',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: 'clamp(32px, 8vw, 48px)',
                marginBottom: 'clamp(12px, 3vw, 16px)'
              }}>
                ⏳
              </div>
              <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Loading AI assistants...</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
              gap: 'clamp(16px, 4vw, 32px)',
              padding: '0 clamp(8px, 2vw, 16px)'
            }}>
              {filteredAgents.map(agent => (
                <div
                  key={agent.id}
                  title=""
                  style={{
                    borderRadius: 'clamp(16px, 3vw, 24px)',
                    padding: 'clamp(16px, 4vw, 32px)',
                    backdropFilter: 'blur(30px)',
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 'clamp(280px, 60vw, 320px)'
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
                    gap: 'clamp(12px, 3vw, 16px)',
                    marginBottom: 'clamp(16px, 4vw, 20px)'
                  }}>
                    <div 
                      title=""
                      style={{
                        width: 'clamp(50px, 12vw, 60px)',
                        height: 'clamp(50px, 12vw, 60px)',
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${agent.gradient})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 'clamp(16px, 4vw, 20px)'
                      }}>
                      {agent.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 
                        title=""
                        style={{
                          fontSize: 'clamp(14px, 3.5vw, 18px)',
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
                        gap: 'clamp(6px, 1.5vw, 8px)'
                      }}>
                        <span title="" style={{ color: '#fbbf24', fontSize: 'clamp(12px, 3vw, 14px)' }}>⭐</span>
                        <span title="" style={{ color: '#6b7280', fontSize: 'clamp(10px, 2.5vw, 14px)' }}>
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
                      marginBottom: 'clamp(12px, 3vw, 24px)',
                      fontSize: 'clamp(12px, 3vw, 14px)',
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
                    justifyContent: 'space-between',
                    gap: 'clamp(8px, 2vw, 12px)',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'clamp(6px, 1.5vw, 8px)'
                    }}>
                      <span title="" style={{ color: '#10b981', fontWeight: 'bold', fontSize: 'clamp(12px, 3vw, 14px)' }}>💰</span>
                      <span title="" style={{ color: '#1f2937', fontWeight: '600', fontSize: 'clamp(12px, 3vw, 14px)' }}>
                        {(() => {
                          const agentSlug = getAgentSlug(agent.name);
                          const agentPrice = getAgentPrice(agentSlug);
                          return agentPrice ? agentPrice.priceDisplay : 'Price TBD';
                        })()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAgentClick(agent)}
                      disabled={isProcessing === agent.id}
                      style={{
                        background: isProcessing === agent.id
                          ? '#9ca3af'
                          : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: 'white',
                        padding: 'clamp(10px, 3vw, 12px) clamp(14px, 3.5vw, 24px)',
                        borderRadius: 'clamp(8px, 2vw, 12px)',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: 'clamp(11px, 3vw, 14px)',
                        minHeight: '44px',
                        minWidth: 'clamp(80px, 20vw, 100px)',
                        cursor: isProcessing === agent.id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isProcessing === agent.id ? 0.7 : 1,
                        textAlign: 'center' as const,
                        whiteSpace: 'nowrap' as const
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
              padding: 'clamp(40px, 10vw, 60px) clamp(16px, 4vw, 20px)',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: 'clamp(32px, 8vw, 48px)',
                marginBottom: 'clamp(12px, 3vw, 16px)'
              }}>
                🔍
              </div>
              <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>No assistants found matching your criteria.</p>
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
                The future of AI automation is here. Build, deploy, and scale AI assistants for your business.
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
        
        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          /* Hide floating elements on mobile */
          div[style*="animation: float"] {
            display: none !important;
          }
          
          /* Ensure buttons have proper touch targets */
          button, a {
            min-height: 44px !important;
          }
          
          /* Improve text readability */
          p, span {
            word-break: break-word;
          }
          
          /* Single column for all grids */
          div[style*="grid-template-columns: repeat(auto-fit"] {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 480px) {
          /* Extra small screens - hide more decorative elements */
          div[style*="position: absolute"][style*="background: rgba"] {
            display: none !important;
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