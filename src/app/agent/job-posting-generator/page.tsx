'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { getAgentInfo } from '@/lib/agentUtils'
import AgentLayout from '@/components/agent-shared/AgentLayout'
import ProcessingStatus from '@/components/agent-shared/ProcessingStatus'
import ResultsDisplay from '@/components/agent-shared/ResultsDisplay'
import CreditCounter from '@/components/agent-shared/CreditCounter'
import { colors, gradients, spacing, typography, borderRadius, transitions } from '@/lib/designSystem'
import { stylePatterns, cardStyles, textStyles } from '@/lib/styleUtils'

function JobPostingGeneratorForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateCredits } = useUserStore()
  
  // Get agent info from URL params
  const agentId = searchParams.get('agentId')
  const cost = parseInt(searchParams.get('cost') || '25')
  
  // Form state
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    description: '',
    seniority: '',
    contractType: '',
    location: '',
    language: 'English',
    companyWebsite: '',
    howToApply: ''
  })
  
  // Component state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [results, setResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)

  // Get agent info
  const agentInfo = getAgentInfo('job-posting-generator')

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) return null

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setResults(null)
    setShowResults(false)
  }

  const isFormValid = () => {
    return formData.jobTitle.trim() && 
           formData.companyName.trim() && 
           formData.description.trim() && 
           formData.seniority && 
           formData.contractType && 
           formData.location
  }

  const generateJobPosting = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsProcessing(true)
    setShowResults(false)
    setProcessingStatus('Generating job posting...')

    try {
      // Create the message text that combines all form data
      const messageText = `Create a professional job posting with the following details:

Job Title: ${formData.jobTitle}
Company: ${formData.companyName}
Description: ${formData.description}
Seniority Level: ${formData.seniority}
Contract Type: ${formData.contractType}
Location: ${formData.location}
Language: ${formData.language}
Company Website: ${formData.companyWebsite}
How to Apply: ${formData.howToApply}

Please create a complete, engaging job posting based on this information.`

      // Format data according to n8n workflow structure
      const webhookPayload = {
        message: {
          text: messageText
        },
        sessionId: `job_posting_${Date.now()}`,
        userId: user.id,
        agentId: agentId || 'job-posting-generator',
        jobTitle: formData.jobTitle,
        companyName: formData.companyName
      }

      setProcessingStatus('Processing with AI...')
      
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_JOB_POSTING
      
      if (!webhookUrl) {
        throw new Error('Job posting generator webhook not configured')
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const responseData = await response.json()
      
      // Extract the AI response from the workflow result
      let jobPosting = ''
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
        jobPosting = responseData[0].output
      } else if (responseData && responseData.output) {
        jobPosting = responseData.output
      } else if (responseData && responseData.jobPosting) {
        jobPosting = responseData.jobPosting
      } else if (responseData && typeof responseData === 'string') {
        jobPosting = responseData
      } else {
        jobPosting = JSON.stringify(responseData, null, 2)
      }

      // Format results for display
      const formattedResults = {
        status: 'success',
        analysis: jobPosting,
        processed_at: new Date().toISOString(),
        jobTitle: formData.jobTitle,
        companyName: formData.companyName
      }

      setResults(formattedResults)
      setShowResults(true)

      // Deduct credits only on successful completion
      await updateCredits(-cost)
      toast.success(`Job posting generated! ${cost} credits used.`)

    } catch (error: any) {
      console.error('Job posting generation error:', error)
      
      let errorMessage = 'Failed to generate job posting. Please try again.'
      
      if (error.message.includes('webhook not configured')) {
        errorMessage = 'Job posting generator is not properly configured.'
      } else if (error.message.includes('HTTP 404')) {
        errorMessage = 'Job posting service is currently unavailable.'
      } else if (error.message.includes('HTTP 429')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = 'Server error occurred. Please try again later.'
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
      
      {/* Processing Status - Always visible at top */}
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
          {/* Job Posting Form */}
          <div style={{
            ...cardStyles.base,
            marginBottom: spacing.lg
          }}>
            <h3 style={{
              ...textStyles.h4,
              marginBottom: spacing.lg,
              color: colors.gray[800],
              borderBottom: `2px solid ${colors.gray[100]}`,
              paddingBottom: spacing.sm
            }}>
              📝 Job Posting Details
            </h3>

            {/* Basic Information Section */}
            <div style={{
              marginBottom: spacing.xl,
              padding: spacing.md,
              backgroundColor: colors.gray[50],
              borderRadius: borderRadius.md,
              border: `1px solid ${colors.gray[100]}`
            }}>
              <h4 style={{
                ...textStyles.small,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[600],
                marginBottom: spacing.md,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px'
              }}>
                Basic Information
              </h4>

            {/* Job Title */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700]
              }}>
                💼 Job Title *
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                disabled={isProcessing}
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
                  e.target.style.borderColor = colors.primary[500]
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              />
            </div>

            {/* Company Name */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700]
              }}>
                🏢 Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="e.g., TechCorp Inc."
                disabled={isProcessing}
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
                  e.target.style.borderColor = colors.primary[500]
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              />
            </div>

            {/* Job Description */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700]
              }}>
                📝 Job Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the role, key requirements, company culture, etc."
                rows={4}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  transition: transitions.normal,
                  backgroundColor: colors.gray[50],
                  resize: 'vertical' as const,
                  minHeight: '100px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary[500]
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              />
            </div>
            </div>

            {/* Job Requirements Section */}
            <div style={{
              marginBottom: spacing.xl,
              padding: spacing.md,
              backgroundColor: colors.primary[50],
              borderRadius: borderRadius.md,
              border: `1px solid ${colors.primary[100]}`
            }}>
              <h4 style={{
                ...textStyles.small,
                fontWeight: typography.fontWeight.semibold,
                color: colors.primary[600],
                marginBottom: spacing.md,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px'
              }}>
                Job Requirements
              </h4>

            {/* Seniority Level */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700]
              }}>
                📊 Seniority Level *
              </label>
              <select
                value={formData.seniority}
                onChange={(e) => handleInputChange('seniority', e.target.value)}
                disabled={isProcessing}
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
                  e.target.style.borderColor = colors.primary[500]
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              >
                <option value="">Select seniority level...</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Junior">Junior</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Principal">Principal</option>
                <option value="Director">Director</option>
                <option value="VP">VP</option>
                <option value="C-Level">C-Level</option>
              </select>
            </div>

            {/* Contract Type */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700]
              }}>
                📋 Contract Type *
              </label>
              <select
                value={formData.contractType}
                onChange={(e) => handleInputChange('contractType', e.target.value)}
                disabled={isProcessing}
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
                  e.target.style.borderColor = colors.primary[500]
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              >
                <option value="">Select contract type...</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>

            {/* Location */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700]
              }}>
                📍 Location *
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={isProcessing}
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
                  e.target.style.borderColor = colors.primary[500]
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              >
                <option value="">Select location...</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="New York, NY">New York, NY</option>
                <option value="San Francisco, CA">San Francisco, CA</option>
                <option value="London, UK">London, UK</option>
                <option value="Berlin, Germany">Berlin, Germany</option>
                <option value="Toronto, Canada">Toronto, Canada</option>
                <option value="Dubai, UAE">Dubai, UAE</option>
                <option value="Other">Other</option>
              </select>
            </div>
            </div>

            {/* Additional Details Section */}
            <div style={{
              marginBottom: spacing.md,
              padding: spacing.md,
              backgroundColor: colors.success[50] || '#f0fdf4',
              borderRadius: borderRadius.md,
              border: `1px solid ${colors.success[100] || '#dcfce7'}`
            }}>
              <h4 style={{
                ...textStyles.small,
                fontWeight: typography.fontWeight.semibold,
                color: colors.success[600],
                marginBottom: spacing.md,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px'
              }}>
                Additional Details (Optional)
              </h4>

            {/* Language */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700]
              }}>
                🌐 Language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                placeholder="e.g., English, Spanish, French"
                disabled={isProcessing}
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
                  e.target.style.borderColor = colors.primary[500]
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              />
            </div>

            {/* Company Website */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700]
              }}>
                🌍 Company Website
              </label>
              <input
                type="url"
                value={formData.companyWebsite}
                onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                placeholder="https://www.company.com"
                disabled={isProcessing}
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
                  e.target.style.borderColor = colors.primary[500]
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              />
            </div>

            {/* How to Apply */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.xs,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700]
              }}>
                📧 How to Apply
              </label>
              <textarea
                value={formData.howToApply}
                onChange={(e) => handleInputChange('howToApply', e.target.value)}
                placeholder="Instructions for candidates on how to apply for this position"
                rows={3}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  transition: transitions.normal,
                  backgroundColor: colors.gray[50],
                  resize: 'vertical' as const,
                  minHeight: '80px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary[500]
                  e.target.style.backgroundColor = colors.white
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.gray[200]
                  e.target.style.backgroundColor = colors.gray[50]
                }}
              />
            </div>
            </div>
          </div>
          
          {showResults && results && (
            <ResultsDisplay 
              results={results} 
              title="Generated Job Posting" 
              isVisible={showResults} 
            />
          )}
        </div>

        <div>
          <CreditCounter 
            cost={cost} 
            onProcess={generateJobPosting} 
            disabled={!isFormValid()} 
            processing={isProcessing}
          />
        </div>
      </div>
    </AgentLayout>
  )
}

export default function JobPostingGeneratorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobPostingGeneratorForm />
    </Suspense>
  )
}