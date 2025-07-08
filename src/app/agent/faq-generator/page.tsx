'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { getAgentInfo } from '@/lib/agentUtils'
import { getAgentPrice } from '@/lib/agentPricing'
import AgentLayout from '@/components/agent-shared/AgentLayout'
import ProcessingStatus from '@/components/agent-shared/ProcessingStatus'
import ResultsDisplay from '@/components/agent-shared/ResultsDisplay'
import WalletBalance from '@/components/agent-shared/WalletBalance'
import FileUpload from '@/components/agent-shared/FileUpload'
import { colors, spacing, typography, borderRadius, transitions } from '@/lib/designSystem'
import { textStyles } from '@/lib/styleUtils'

function FAQGeneratorForm() {
  const router = useRouter()
  const { user, updateWallet } = useUserStore()
  
  // Form state
  const [formData, setFormData] = useState({
    file: null as File | null,
    url: '',
    language: 'English'
  })
  
  // Component state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [results, setResults] = useState<object | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Get agent info and pricing
  const agentInfo = getAgentInfo('faq-generator')
  const agentPrice = getAgentPrice('faq-generator')

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

  // Handle file selection
  const handleFileSelect = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      file: file
    }))
  }

  // Form validation
  const isFormValid = () => {
    return (formData.file || formData.url.trim()) && formData.language.trim()
  }

  // Main processing function
  const processAgent = async () => {
    if (!isFormValid()) {
      toast.error('Please provide either a file or URL, and specify the language')
      return
    }

    setIsProcessing(true)
    setShowResults(false)
    setProcessingStatus('Analyzing content and generating FAQs...')

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_FAQ_GENERATOR
      
      if (!webhookUrl) {
        throw new Error('FAQ Generator service is not properly configured')
      }

      // Create FormData for N8N webhook
      const formDataPayload = new FormData()
      
      // Add file if provided
      if (formData.file) {
        formDataPayload.append('file', formData.file)
        formDataPayload.append('fileName', formData.file.name)
        formDataPayload.append('fileSize', formData.file.size.toString())
      }
      
      // Add URL if provided  
      if (formData.url.trim()) {
        formDataPayload.append('url', formData.url.trim())
      }
      
      // Add other form data
      formDataPayload.append('language', formData.language)
      formDataPayload.append('userId', user.id)
      formDataPayload.append('agentId', '11')

      setProcessingStatus('Processing content and extracting key information...')

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formDataPayload
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json()
      
      // Handle N8N response format
      let faqContent = ''
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
        faqContent = responseData[0].output
      } else if (responseData && responseData.output) {
        faqContent = responseData.output
      } else if (responseData && responseData.analysis) {
        faqContent = responseData.analysis
      } else if (typeof responseData === 'string') {
        faqContent = responseData
      } else {
        faqContent = JSON.stringify(responseData, null, 2)
      }

      // Format results for display (using 'analysis' field for smart download)
      const formattedResults = {
        status: 'success',
        analysis: faqContent,
        processed_at: new Date().toISOString(),
        source: formData.file ? 'file' : 'url',
        fileName: formData.file?.name,
        sourceUrl: formData.url || undefined,
        language: formData.language,
        contentType: 'faq'
      }

      setResults(formattedResults)
      setShowResults(true)

      // Deduct wallet balance only on success  
      const agentPrice = getAgentPrice('faq-generator')
      if (agentPrice) {
        await updateWallet(-agentPrice.price)
        toast.success(`FAQ generated successfully! ${agentPrice.priceDisplay} used.`)
      }

    } catch (error: unknown) {
      console.error('Processing error:', error)
      
      // Specific error messages
      let errorMessage = 'Failed to generate FAQ. Please try again.'
      if (error instanceof Error) {
        if (error.message.includes('not properly configured')) {
          errorMessage = 'FAQ Generator service is not properly configured.'
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'FAQ Generator service is currently unavailable.'
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Access denied to FAQ Generator service.'
        } else if (error.message.includes('File too large')) {
          errorMessage = 'File is too large. Please upload a smaller file.'
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
      setProcessingStatus('')
    }
  }

  return (
    <AgentLayout title={agentInfo.title} description={agentInfo.description} icon={agentInfo.icon} cost={agentPrice?.price || 0}>
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
          {/* Content Source Section */}
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
              📄 Content Source
            </h4>
            
            {/* File Upload Option */}
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                ...textStyles.small,
                fontWeight: typography.fontWeight.medium,
                color: colors.gray[700]
              }}>
                Upload file to automatically generate your FAQs
              </label>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.md"
                maxSize={25} // 25MB
                disabled={isProcessing}
              />
              {formData.file && (
                <div style={{
                  marginTop: spacing.xs,
                  padding: spacing.xs,
                  background: colors.success[50] || '#f0fdf4',
                  borderRadius: borderRadius.sm,
                  fontSize: typography.fontSize.sm,
                  color: colors.success[700] || '#15803d'
                }}>
                  ✅ Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* OR Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: spacing.lg,
              gap: spacing.md
            }}>
              <div style={{ flex: 1, height: '1px', background: colors.gray[200] }}></div>
              <span style={{
                ...textStyles.small,
                color: colors.gray[500],
                fontWeight: typography.fontWeight.medium,
                padding: `0 ${spacing.sm}`
              }}>
                OR
              </span>
              <div style={{ flex: 1, height: '1px', background: colors.gray[200] }}></div>
            </div>

            {/* URL Input Option */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                ...textStyles.small,
                fontWeight: typography.fontWeight.medium,
                color: colors.gray[700]
              }}>
                Enter a URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                disabled={isProcessing}
                placeholder="https://example.com/documentation"
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

          {/* Configuration Section */}
          <div style={{
            marginBottom: spacing.xl,
            padding: spacing.lg,
            backgroundColor: '#faf5ff', // Light purple for FAQ theme
            borderRadius: borderRadius.lg,
            border: '1px solid #e9d5ff'
          }}>
            <h4 style={{
              ...textStyles.small,
              fontWeight: typography.fontWeight.semibold,
              color: '#7c3aed', // Purple-600
              marginBottom: spacing.md,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px'
            }}>
              ⚙️ Configuration
            </h4>
            
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
          
          {showResults && results && (
            <ResultsDisplay 
              results={results} 
              title="Generated FAQ" 
              isVisible={showResults} 
            />
          )}
        </div>

        <div>
          <WalletBalance 
            agentSlug="faq-generator"
            onProcess={processAgent} 
            disabled={!isFormValid()} 
            processing={isProcessing}
          />
        </div>
      </div>
    </AgentLayout>
  )
}

export default function FAQGeneratorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FAQGeneratorForm />
    </Suspense>
  )
}