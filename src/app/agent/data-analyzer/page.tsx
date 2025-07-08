'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { getAgentInfo } from '@/lib/agentUtils'
import { getAgentPrice } from '@/lib/agentPricing'
import AgentLayout from '@/components/agent-shared/AgentLayout'
import FileUpload from '@/components/agent-shared/FileUpload'
import ProcessingStatus from '@/components/agent-shared/ProcessingStatus'
import ResultsDisplay from '@/components/agent-shared/ResultsDisplay'
import WalletBalance from '@/components/agent-shared/WalletBalance'
import { colors, gradients, spacing, typography, borderRadius, transitions } from '@/lib/designSystem'
import { stylePatterns, cardStyles, textStyles } from '@/lib/styleUtils'

function DataAnalyzerForm() {
  const router = useRouter()
  const { user, updateWallet } = useUserStore()
  
  // Get agent pricing
  const agentPrice = getAgentPrice('data-analyzer')
  const agentSlug = 'data-analyzer'
  
  // Component state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState('summary')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [results, setResults] = useState<object | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Get agent info
  const agentInfo = getAgentInfo('data-analyzer')

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) return null

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
    setResults(null)
    setShowResults(false)
  }

  const processFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    setIsProcessing(true)
    setShowResults(false)
    setProcessingStatus('Uploading file...')

    try {
      // Step 1: Prepare FormData for n8n webhook
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('analysisType', analysisType)
      formData.append('userId', user.id)
      formData.append('agentSlug', agentSlug)
      formData.append('fileName', selectedFile.name)
      formData.append('fileSize', selectedFile.size.toString())

      // Step 2: Send to n8n webhook
      setProcessingStatus('Analyzing data with AI...')
      
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_DATA_ANALYZER
      
      if (!webhookUrl) {
        throw new Error('Data analyzer webhook not configured')
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
      }

      setProcessingStatus('Processing results...')
      
      // Get results directly from n8n response
      const results = await response.json()

      // Step 3: Display results
      setResults(results)
      setShowResults(true)

      // Step 4: Deduct wallet balance only after successful completion
      await updateWallet(-agentPrice!.price)
      toast.success(`Analysis complete! ${agentPrice!.priceDisplay} used.`)

    } catch (error) {
      console.error('Processing error:', error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('not configured')) {
          toast.error('Data analyzer service not configured. Please contact support.')
        } else if (error.message.includes('Webhook failed')) {
          toast.error('Failed to connect to analysis service. Please try again.')
        } else {
          toast.error(`Analysis failed: ${error.message}`)
        }
      } else {
        toast.error('Failed to analyze file. Please try again.')
      }
    } finally {
      setIsProcessing(false)
      setProcessingStatus('')
    }
  }

  return (
    <AgentLayout
      title={agentInfo.title}
      description={agentInfo.description}
      icon={agentInfo.icon}
      cost={agentPrice?.price || 0}
    >
      <Toaster position="top-right" />
      
      <div style={{
        ...stylePatterns.responsiveGrid,
        alignItems: 'start'
      }}>
        {/* Main Content */}
        <div>
          {/* File Upload Section */}
          <div style={{
            ...cardStyles.base,
            marginBottom: spacing.lg
          }}>
            <h3 style={{
              ...textStyles.h4,
              marginBottom: spacing.md
            }}>
              Upload Data File
            </h3>
            
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedTypes=".pdf,.csv,.xlsx,.xls"
              maxSize={25}
              placeholder="Upload PDF, CSV, or Excel file for analysis"
              icon="📊"
            />
          </div>

          {/* Analysis Options */}
          {selectedFile && (
            <div style={{
              ...cardStyles.base,
              marginBottom: spacing.lg
            }}>
              <h3 style={{
                ...textStyles.h4,
                marginBottom: spacing.md
              }}>
                Analysis Type
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
                gap: spacing.sm
              }}>
                {[
                  { id: 'summary', label: 'Data Summary', desc: 'Basic statistics and overview' },
                  { id: 'trends', label: 'Trend Analysis', desc: 'Identify patterns and trends' },
                  { id: 'insights', label: 'Business Insights', desc: 'AI-powered recommendations' },
                  { id: 'full', label: 'Complete Analysis', desc: 'All analysis types combined' }
                ].map(option => (
                  <label
                    key={option.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                      padding: spacing.md,
                      border: `2px solid ${analysisType === option.id ? colors.primary[500] : colors.gray[200]}`,
                      borderRadius: borderRadius.lg,
                      cursor: 'pointer',
                      background: analysisType === option.id ? colors.primary[50] : colors.white,
                      transition: transitions.normal
                    }}
                  >
                    <input
                      type="radio"
                      name="analysisType"
                      value={option.id}
                      checked={analysisType === option.id}
                      onChange={(e) => setAnalysisType(e.target.value)}
                      style={{ margin: 0 }}
                    />
                    <div>
                      <div style={{ 
                        fontWeight: typography.fontWeight.semibold, 
                        marginBottom: spacing.xs, 
                        fontSize: typography.fontSize.base 
                      }}>
                        {option.label}
                      </div>
                      <div style={{ 
                        fontSize: typography.fontSize.sm, 
                        color: colors.gray[500] 
                      }}>
                        {option.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Processing Status */}
          <ProcessingStatus
            isProcessing={isProcessing}
            status={processingStatus}
          />

          {/* Results */}
          {showResults && results && (
            <ResultsDisplay
              results={results}
              title="Analysis Results"
              isVisible={showResults}
            />
          )}
        </div>

        {/* Sidebar */}
        <div>
          <WalletBalance
            agentSlug={agentSlug}
            onProcess={processFile}
            disabled={!selectedFile}
            processing={isProcessing}
          />
        </div>
      </div>
    </AgentLayout>
  )
}

export default function DataAnalyzerPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: gradients.bgPrimary,
        ...stylePatterns.flexCenter
      }}>
        <div style={{ 
          color: colors.primary[500], 
          fontSize: typography.fontSize.lg 
        }}>Loading...</div>
      </div>
    }>
      <DataAnalyzerForm />
    </Suspense>
  )
}