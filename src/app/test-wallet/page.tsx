'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { WALLET_PACKAGES } from '@/lib/walletUtils'
import { AGENT_PRICING } from '@/lib/agentPricing'
import Header from '@/components/shared/Header'
import { colors, spacing, typography, gradients } from '@/lib/designSystem'
import { cardStyles, textStyles, stylePatterns } from '@/lib/styleUtils'

export default function TestWalletPage() {
  const router = useRouter()
  const { user, refreshUser, updateWallet } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [databaseData, setDatabaseData] = useState<any>(null)
  const [testResults, setTestResults] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    // Fetch database state on load
    fetchDatabaseState()
  }, [user, router])

  const fetchDatabaseState = async () => {
    try {
      const response = await fetch('/api/wallet/verify-database')
      const data = await response.json()
      setDatabaseData(data)
      
      if (data.success) {
        console.log('Database state:', data.data)
        toast.success('Database state loaded successfully')
      } else {
        console.error('Database verification failed:', data.error)
        toast.error('Failed to load database state')
      }
    } catch (error) {
      console.error('Error fetching database state:', error)
      toast.error('Error loading database state')
    }
  }

  const testWalletTopUp = async (packageId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/wallet/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          userId: user?.id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.open(data.url, '_blank')
          toast.success('Checkout created successfully!')
          
          // Add to test results
          setTestResults(prev => [...prev, {
            type: 'checkout-created',
            packageId,
            timestamp: new Date().toISOString(),
            success: true,
            url: data.url
          }])
        }
      } else {
        const errorData = await response.json()
        toast.error(`Checkout failed: ${errorData.error}`)
        
        setTestResults(prev => [...prev, {
          type: 'checkout-failed',
          packageId,
          timestamp: new Date().toISOString(),
          success: false,
          error: errorData.error
        }])
      }
    } catch (error: any) {
      console.error('Test error:', error)
      toast.error('Test failed')
      
      setTestResults(prev => [...prev, {
        type: 'test-error',
        packageId,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      }])
    } finally {
      setIsLoading(false)
    }
  }


  const testAgentUsage = async (agentSlug: string) => {
    const agentPrice = AGENT_PRICING[agentSlug]
    if (!agentPrice) {
      toast.error('Agent pricing not found')
      return
    }

    if (!user || user.wallet_balance < agentPrice.price) {
      toast.error(`Insufficient funds! Need ${agentPrice.price} AED, have ${user?.wallet_balance || 0} AED`)
      return
    }

    try {
      // Simulate agent usage
      await updateWallet(-agentPrice.price)
      await refreshUser()
      
      toast.success(`Agent used successfully! ${agentPrice.price} AED deducted`)
      
      setTestResults(prev => [...prev, {
        type: 'agent-usage',
        agentSlug,
        amount: agentPrice.price,
        timestamp: new Date().toISOString(),
        success: true
      }])
    } catch (error: any) {
      console.error('Agent usage error:', error)
      toast.error('Agent usage failed')
      
      setTestResults(prev => [...prev, {
        type: 'agent-usage-failed',
        agentSlug,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      }])
    }
  }

  const clearTestResults = () => {
    setTestResults([])
    toast.success('Test results cleared')
  }

  const refreshData = async () => {
    await refreshUser()
    await fetchDatabaseState()
    toast.success('Data refreshed')
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: typography.fontSize.lg }}>Please log in to access wallet testing</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: gradients.bgPrimary
    }}>
      <Header currentPage="agent" />
      <Toaster position="top-right" />
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `${spacing.xl} ${spacing.lg}`,
        display: 'grid',
        gap: spacing.xl
      }}>
        {/* Page Header */}
        <div style={{
          ...cardStyles.elevated,
          textAlign: 'center'
        }}>
          <h1 style={{
            ...textStyles.h2,
            marginBottom: spacing.md,
            background: gradients.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            🧪 Wallet System Testing
          </h1>
          <p style={{
            ...textStyles.body,
            color: colors.gray[600],
            marginBottom: spacing.lg
          }}>
            Test all wallet functionality and verify database updates
          </p>
          
          <div style={{
            display: 'flex',
            gap: spacing.md,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={refreshData}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                background: gradients.success,
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium
              }}
            >
              🔄 Refresh Data
            </button>
            
            <button
              onClick={clearTestResults}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                background: gradients.warning,
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium
              }}
            >
              🗑️ Clear Results
            </button>
          </div>
        </div>

        {/* Current User Status */}
        <div style={{
          ...cardStyles.elevated
        }}>
          <h2 style={{
            ...textStyles.h3,
            marginBottom: spacing.md,
            color: colors.gray[800]
          }}>
            👤 Current User Status
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.md
          }}>
            <div style={{
              padding: spacing.md,
              background: colors.gray[50],
              borderRadius: '8px',
              border: `1px solid ${colors.gray[200]}`
            }}>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>Email</div>
              <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium }}>
                {user.email}
              </div>
            </div>
            
            <div style={{
              padding: spacing.md,
              background: colors.gray[50],
              borderRadius: '8px',
              border: `1px solid ${colors.gray[200]}`
            }}>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>Wallet Balance</div>
              <div style={{ 
                fontSize: typography.fontSize.lg, 
                fontWeight: typography.fontWeight.bold,
                color: colors.success[600]
              }}>
                {user.wallet_balance?.toFixed(2) || '0.00'} AED
              </div>
            </div>
            
            <div style={{
              padding: spacing.md,
              background: colors.gray[50],
              borderRadius: '8px',
              border: `1px solid ${colors.gray[200]}`
            }}>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>User ID</div>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {user.id}
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Top-Up Testing */}
        <div style={{
          ...cardStyles.elevated
        }}>
          <h2 style={{
            ...textStyles.h3,
            marginBottom: spacing.md,
            color: colors.gray[800]
          }}>
            💳 Test Wallet Top-Up
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.md
          }}>
            {WALLET_PACKAGES.map((pkg) => (
              <div key={pkg.id} style={{
                padding: spacing.md,
                background: colors.white,
                borderRadius: '8px',
                border: `2px solid ${pkg.popular ? colors.primary[500] : colors.gray[200]}`,
                position: 'relative'
              }}>
                {pkg.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: gradients.primary,
                    color: colors.white,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: '12px',
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium
                  }}>
                    POPULAR
                  </div>
                )}
                
                <div style={{
                  textAlign: 'center',
                  marginBottom: spacing.md
                }}>
                  <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold }}>
                    {pkg.label}
                  </div>
                  {pkg.bonus && (
                    <div style={{ fontSize: typography.fontSize.sm, color: colors.success[600] }}>
                      +{pkg.bonus} AED bonus
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => testWalletTopUp(pkg.id)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: `${spacing.sm} ${spacing.md}`,
                    background: pkg.popular ? gradients.primary : gradients.success,
                    color: colors.white,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  {isLoading ? 'Testing...' : 'Test Top-Up'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Usage Testing */}
        <div style={{
          ...cardStyles.elevated
        }}>
          <h2 style={{
            ...textStyles.h3,
            marginBottom: spacing.md,
            color: colors.gray[800]
          }}>
            🤖 Test Agent Usage
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: spacing.md
          }}>
            {Object.entries(AGENT_PRICING).map(([slug, agent]) => (
              <div key={slug} style={{
                padding: spacing.md,
                background: colors.white,
                borderRadius: '8px',
                border: `1px solid ${colors.gray[200]}`
              }}>
                <div style={{
                  marginBottom: spacing.sm
                }}>
                  <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium }}>
                    {agent.name}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>
                    {agent.priceDisplay}
                  </div>
                </div>
                
                <button
                  onClick={() => testAgentUsage(slug)}
                  disabled={!user || user.wallet_balance < agent.price}
                  style={{
                    width: '100%',
                    padding: `${spacing.sm} ${spacing.md}`,
                    background: (!user || user.wallet_balance < agent.price) 
                      ? colors.gray[300] 
                      : gradients.primary,
                    color: (!user || user.wallet_balance < agent.price) 
                      ? colors.gray[500] 
                      : colors.white,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (!user || user.wallet_balance < agent.price) 
                      ? 'not-allowed' 
                      : 'pointer',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  {(!user || user.wallet_balance < agent.price) ? 'Insufficient Funds' : 'Test Usage'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div style={{
            ...cardStyles.elevated
          }}>
            <h2 style={{
              ...textStyles.h3,
              marginBottom: spacing.md,
              color: colors.gray[800]
            }}>
              📊 Test Results
            </h2>
            
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: `1px solid ${colors.gray[200]}`,
              borderRadius: '8px'
            }}>
              {testResults.map((result, index) => (
                <div key={index} style={{
                  padding: spacing.md,
                  borderBottom: index < testResults.length - 1 ? `1px solid ${colors.gray[200]}` : 'none',
                  background: result.success ? colors.success[50] : colors.danger[50]
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.xs
                  }}>
                    <span style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: result.success ? colors.success[700] : colors.danger[700]
                    }}>
                      {result.success ? '✅' : '❌'} {result.type}
                    </span>
                    <span style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.gray[500]
                    }}>
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.gray[600],
                    fontFamily: 'monospace'
                  }}>
                    {JSON.stringify(result, null, 2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Database State */}
        {databaseData && (
          <div style={{
            ...cardStyles.elevated
          }}>
            <h2 style={{
              ...textStyles.h3,
              marginBottom: spacing.md,
              color: colors.gray[800]
            }}>
              🗄️ Database State
            </h2>
            
            <div style={{
              background: colors.gray[50],
              borderRadius: '8px',
              padding: spacing.md,
              border: `1px solid ${colors.gray[200]}`,
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <pre style={{
                fontSize: typography.fontSize.xs,
                color: colors.gray[700],
                margin: 0,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
              }}>
                {JSON.stringify(databaseData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}