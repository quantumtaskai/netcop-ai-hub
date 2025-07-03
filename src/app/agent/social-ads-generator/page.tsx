'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { getAgentInfo } from '@/lib/agentUtils'
import { getAgentPrice } from '@/lib/agentPricing'
import AgentLayout from '@/components/agent-shared/AgentLayout'
import ProcessingStatus from '@/components/agent-shared/ProcessingStatus'
import ResultsDisplay from '@/components/agent-shared/ResultsDisplay'
import WalletBalance from '@/components/agent-shared/WalletBalance'
import { colors, gradients, spacing, typography, borderRadius, transitions } from '@/lib/designSystem'
import { stylePatterns, cardStyles, textStyles } from '@/lib/styleUtils'

function SocialAdsGeneratorForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateWallet } = useUserStore()
  
  // Get agent info from URL params
  const agentId = searchParams.get('agentId')
  const cost = parseInt(searchParams.get('cost') || '25')
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    includeEmoji: '',
    socialPlatform: '',
    language: 'English'
  })
  
  // Component state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [results, setResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)

  // Get agent info
  const agentInfo = getAgentInfo('social-ads-generator')

  // Redirect if no user
  useEffect(() => {
    if (!user) router.push('/')
  }, [user, router])

  if (!user) return null

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Form validation
  const isFormValid = () => {
    return formData.description.trim() && 
           formData.includeEmoji && 
           formData.socialPlatform &&
           formData.language.trim()
  }

  // Main processing function
  const processAgent = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsProcessing(true)
    setShowResults(false)
    setProcessingStatus('Creating your social media ad...')

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_SOCIAL_ADS
      
      if (!webhookUrl) {
        throw new Error('Social Ads service is not properly configured')
      }

      // Create the message text that combines all form data (matching test.html format)
      const messageText = `Create a social media advertisement with the following details:

Description: ${formData.description}
Include Emoji: ${formData.includeEmoji}
Social Media Platform: ${formData.socialPlatform}
Language: ${formData.language}

Please create an engaging, platform-optimized social media ad based on this information.`

      // Format data according to N8N workflow structure (matching test.html)
      const webhookPayload = {
        message: {
          text: messageText
        },
        sessionId: `social_ad_${Date.now()}` // Unique session ID for each request
      }

      setProcessingStatus('Generating platform-optimized content...')

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json()
      
      // Extract the AI response from the workflow result (matching output.json format)
      let adContent = ''
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
        // Handle the array format: [{ "output": "..." }]
        adContent = responseData[0].output
      } else if (responseData && responseData.output) {
        // Handle direct object format: { "output": "..." }
        adContent = responseData.output
      } else if (responseData && typeof responseData === 'string') {
        // Handle direct string response
        adContent = responseData
      } else {
        // Fallback: show raw response
        adContent = JSON.stringify(responseData, null, 2)
      }

      // Format results for display (IMPORTANT: use 'analysis' field for ResultsDisplay)
      const formattedResults = {
        status: 'success',
        analysis: adContent,
        processed_at: new Date().toISOString(),
        platform: formData.socialPlatform,
        language: formData.language,
        includesEmoji: formData.includeEmoji === 'Yes'
      }

      setResults(formattedResults)
      setShowResults(true)

      // Deduct wallet balance only on success
      const agentPrice = getAgentPrice('social-ads-generator')
      if (agentPrice) {
        await updateWallet(-agentPrice.price)
        toast.success(`Social ad generated successfully! ${agentPrice.priceDisplay} used.`)
      }

    } catch (error: any) {
      console.error('Processing error:', error)
      
      // Specific error messages
      let errorMessage = 'Failed to generate social ad. Please try again.'
      if (error.message.includes('not properly configured')) {
        errorMessage = 'Social Ads service is not properly configured.'
      } else if (error.message.includes('HTTP 404')) {
        errorMessage = 'Social Ads service is currently unavailable.'
      } else if (error.message.includes('HTTP 403')) {
        errorMessage = 'Access denied to Social Ads service.'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
      setProcessingStatus('')
    }
  }

  return (
    <AgentLayout title={agentInfo.title} description={agentInfo.description} icon={agentInfo.icon} cost={cost}>
      <Toaster position="top-right" />
      
      {/* Sticky Processing Status */}
      {isProcessing && (
        <div style={{
          position: 'sticky',
          top: '20px',
          zIndex: 10,
          marginBottom: spacing.lg
        }}>
          <ProcessingStatus isProcessing={isProcessing} status={processingStatus} />
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 400px', 
        gap: spacing.lg,
        alignItems: 'start'
      }}>
        <div>
          {/* Content Information Section */}
          <div style={{
            marginBottom: spacing.xl,
            padding: spacing.lg,
            backgroundColor: colors.primary[50] || '#eff6ff',
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.primary[100] || '#dbeafe'}`
          }}>
            <h4 style={{
              ...textStyles.small,
              fontWeight: typography.fontWeight.semibold,
              color: colors.primary[600] || '#2563eb',
              marginBottom: spacing.md,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px'
            }}>
              📝 Content Information
            </h4>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                ...textStyles.small,
                fontWeight: typography.fontWeight.medium,
                color: colors.gray[700]
              }}>
                Describe what you'd like to generate *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isProcessing}
                placeholder="Describe the product, service, or campaign you want to create an ad for. Include key features, target audience, and any specific messaging you want to emphasize."
                required
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  transition: transitions.normal,
                  backgroundColor: colors.gray[50],
                  minHeight: '120px',
                  resize: 'vertical' as const,
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary[500] || '#3b82f6'
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              />
            </div>

            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                ...textStyles.small,
                fontWeight: typography.fontWeight.medium,
                color: colors.gray[700]
              }}>
                Language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                disabled={isProcessing}
                placeholder="e.g., English, Spanish, French, German"
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  transition: transitions.normal,
                  backgroundColor: colors.gray[50],
                  minHeight: '44px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary[500] || '#3b82f6'
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              />
            </div>
          </div>

          {/* Platform & Formatting Section */}
          <div style={{
            marginBottom: spacing.xl,
            padding: spacing.lg,
            backgroundColor: '#fdf4ff', // Light purple for marketing theme
            borderRadius: borderRadius.lg,
            border: '1px solid #fae8ff'
          }}>
            <h4 style={{
              ...textStyles.small,
              fontWeight: typography.fontWeight.semibold,
              color: '#a21caf', // Pink-700
              marginBottom: spacing.md,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px'
            }}>
              📱 Platform & Formatting
            </h4>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                ...textStyles.small,
                fontWeight: typography.fontWeight.medium,
                color: colors.gray[700]
              }}>
                For Social Media Platform *
              </label>
              <select
                value={formData.socialPlatform}
                onChange={(e) => handleInputChange('socialPlatform', e.target.value)}
                disabled={isProcessing}
                required
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  transition: transitions.normal,
                  backgroundColor: colors.gray[50],
                  minHeight: '44px',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary[500] || '#3b82f6'
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              >
                <option value="">Select an option...</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="X (Twitter)">X (Twitter)</option>
              </select>
            </div>

            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                ...textStyles.small,
                fontWeight: typography.fontWeight.medium,
                color: colors.gray[700]
              }}>
                Include Emoji *
              </label>
              <select
                value={formData.includeEmoji}
                onChange={(e) => handleInputChange('includeEmoji', e.target.value)}
                disabled={isProcessing}
                required
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  transition: transitions.normal,
                  backgroundColor: colors.gray[50],
                  minHeight: '44px',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary[500] || '#3b82f6'
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              >
                <option value="">Select an option...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
          
          {showResults && results && (
            <ResultsDisplay 
              results={results} 
              title="Generated Social Media Ad" 
              isVisible={showResults} 
            />
          )}
        </div>

        <div>
          <WalletBalance 
            agentSlug="social-ads-generator"
            onProcess={processAgent} 
            disabled={!isFormValid()} 
            processing={isProcessing}
          />
        </div>
      </div>
    </AgentLayout>
  )
}

export default function SocialAdsGeneratorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SocialAdsGeneratorForm />
    </Suspense>
  )
}