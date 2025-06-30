'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { getAgentInfo } from '@/lib/agentUtils'
import AgentLayout from '@/components/agent-shared/AgentLayout'
import CreditCounter from '@/components/agent-shared/CreditCounter'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: Date
  isHTML?: boolean
}

function FiveWhysChat() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateCredits } = useUserStore()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Get agent info from URL params
  const agentId = searchParams.get('agentId')
  const cost = parseInt(searchParams.get('cost') || '30')
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [reportCompleted, setReportCompleted] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [generatedReport, setGeneratedReport] = useState<any>(null)
  const [showReport, setShowReport] = useState(false)

  // Get agent info
  const agentInfo = getAgentInfo('five-whys')

  // Initialize session and welcome message
  useEffect(() => {
    if (user && !sessionId) {
      const newSessionId = `${user.id}_${Date.now()}`
      setSessionId(newSessionId)
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        sender: 'bot',
        text: `👋 Welcome to the 5 Whys Root Cause Analysis!\n\nI'll help you systematically analyze your problem using the proven 5 Whys methodology.\n\n**To get started, please describe the problem you're experiencing.**\n\nFor example:\n• "Our customer complaints increased by 40% this month"\n• "Production quality has decreased recently"\n• "Website performance is slower than usual"\n\nWhat problem would you like to analyze?`,
        timestamp: new Date(),
        isHTML: true
      }
      setMessages([welcomeMessage])
    }
  }, [user, sessionId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) return null

  // Enhanced markdown to HTML conversion
  const markdownToHTML = (text: string): string => {
    return text
      // Headers with better styling
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 16px; font-weight: 600; margin: 16px 0 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: 700; margin: 24px 0 12px 0; color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 6px;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: 800; margin: 0 0 20px 0; color: #1f2937; text-align: center; padding: 16px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 8px;">$1</h1>')
      // Blockquotes for problem statements
      .replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 12px 0; background: #eff6ff; border-radius: 0 8px 8px 0; font-style: italic; color: #1e40af;">$1</blockquote>')
      // Lists with better spacing
      .replace(/^\* (.*$)/gim, '<li style="margin: 4px 0; color: #374151;">$1</li>')
      .replace(/^\- (.*$)/gim, '<li style="margin: 4px 0; color: #374151;">$1</li>')
      // Bold and italic with better colors
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1f2937;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #6b7280;">$1</em>')
      // Code blocks
      .replace(/`([^`]+)`/g, '<code style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; padding: 2px 6px; font-family: monospace; font-size: 13px; color: #374151;">$1</code>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 24px 0;">')
      // Paragraphs with better spacing
      .replace(/\n\n/g, '</p><p style="margin: 12px 0; line-height: 1.6; color: #374151;">')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6;"><p style="margin: 12px 0; line-height: 1.6; color: #374151;">')
      .replace(/$/, '</p></div>')
  }

  // Check if chat has enough content for report generation
  const canGenerateReport = (): boolean => {
    const userMessages = messages.filter(msg => msg.sender === 'user')
    const botMessages = messages.filter(msg => msg.sender === 'bot' && !msg.text.includes('Welcome to'))
    return userMessages.length >= 2 && botMessages.length >= 2 && !reportCompleted
  }

  // Generate enhanced report from chat history
  const generateReportFromChat = (): string => {
    const userMessages = messages.filter(msg => msg.sender === 'user')
    const botMessages = messages.filter(msg => msg.sender === 'bot' && !msg.text.includes('Welcome to'))
    
    const problemStatement = userMessages[0]?.text || 'Problem not clearly defined'
    
    let report = `# 🔍 5 Whys Root Cause Analysis Report\n\n`
    
    // Executive Summary Section
    report += `## 📋 Executive Summary\n`
    report += `**Analysis Date:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`
    report += `**Methodology:** 5 Whys Root Cause Analysis\n`
    report += `**Analyst:** AI-Powered Analysis Engine\n\n`
    
    // Problem Statement with enhanced formatting
    report += `## 🎯 Problem Statement\n`
    report += `> ${problemStatement}\n\n`
    
    // Analysis Deep Dive
    report += `## 🔍 Analysis Deep Dive\n`
    report += `The following conversation-based analysis systematically explores the root causes:\n\n`
    
    let questionNumber = 1
    messages.forEach((msg, index) => {
      if (msg.sender === 'user' && !msg.text.includes('Welcome')) {
        report += `### Why #${questionNumber}: ${msg.text}\n`
        questionNumber++
      } else if (msg.sender === 'bot' && !msg.text.includes('Welcome to') && !msg.text.includes('Analysis Complete') && !msg.text.includes('Report Generated')) {
        const cleanText = msg.text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/\n+/g, ' ').trim()
        if (cleanText.length > 20) {
          report += `**AI Analysis:** ${cleanText}\n\n`
        }
      }
    })
    
    // Key Findings Section
    report += `## 💡 Key Findings\n`
    report += `Through systematic questioning using the 5 Whys methodology, this analysis revealed:\n\n`
    report += `- **Root Cause Chain:** Each "why" question drilled deeper into underlying causes\n`
    report += `- **Pattern Recognition:** Identified recurring themes and systemic issues\n`
    report += `- **Actionable Insights:** Developed specific, implementable solutions\n`
    report += `- **Prevention Focus:** Addressed both immediate fixes and long-term prevention\n\n`
    
    // Recommendations Section
    report += `## 🎯 Strategic Recommendations\n`
    report += `### Immediate Actions\n`
    report += `- **Address Root Causes:** Focus on the deepest causes identified in the analysis\n`
    report += `- **Quick Wins:** Implement immediately actionable solutions\n`
    report += `- **Stakeholder Alignment:** Ensure all relevant parties understand the findings\n\n`
    
    report += `### Long-term Prevention\n`
    report += `- **Process Improvements:** Implement systematic changes to prevent recurrence\n`
    report += `- **Monitoring Systems:** Establish metrics to track effectiveness\n`
    report += `- **Regular Reviews:** Schedule periodic assessments of implemented solutions\n`
    report += `- **Team Training:** Educate staff on root cause analysis techniques\n\n`
    
    // Implementation Roadmap
    report += `## 🗺️ Implementation Roadmap\n`
    report += `### Phase 1: Immediate (1-2 weeks)\n`
    report += `- Review and validate findings with stakeholders\n`
    report += `- Begin implementation of quick wins\n`
    report += `- Communicate findings to affected teams\n\n`
    
    report += `### Phase 2: Short-term (1-3 months)\n`
    report += `- Implement primary preventive measures\n`
    report += `- Establish monitoring and measurement systems\n`
    report += `- Train relevant personnel\n\n`
    
    report += `### Phase 3: Long-term (3-6 months)\n`
    report += `- Monitor effectiveness of implemented solutions\n`
    report += `- Conduct follow-up analysis if needed\n`
    report += `- Document lessons learned for future reference\n\n`
    
    // Methodology Note
    report += `## 📚 About 5 Whys Methodology\n`
    report += `The 5 Whys technique is a simple yet powerful tool for root cause analysis developed by Sakichi Toyoda and used within Toyota Motor Corporation. By asking "why" five times (or more), teams can identify the root cause of a problem and develop effective countermeasures.\n\n`
    
    report += `---\n`
    report += `*Professional analysis powered by **NetCop AI 5 Whys Analysis Agent***\n`
    report += `*For questions or follow-up analysis, contact your AI consultant*`
    
    return report
  }

  const addMessage = (sender: 'user' | 'bot', text: string, isHTML = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date(),
      isHTML
    }
    setMessages(prev => [...prev, newMessage])
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage = inputText.trim()
    addMessage('user', userMessage)
    setInputText('')
    setIsLoading(true)

    try {
      // Add loading message
      const loadingMessage: Message = {
        id: 'loading',
        sender: 'bot',
        text: '🤔 Analyzing your response...',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, loadingMessage])

      // Call webhook with correct format
      const response = await fetch('https://quantumtaskai.app.n8n.cloud/webhook/5-whys-web', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: { text: userMessage },
          sessionId: sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      const botResponse = result.output || result.message || '[No response received]'

      // Remove loading message and add bot response
      setMessages(prev => prev.filter(msg => msg.id !== 'loading'))
      
      const formattedResponse = markdownToHTML(botResponse)
      addMessage('bot', formattedResponse, true)

      // No automatic credit deduction - only when user generates report

    } catch (error) {
      console.error('Chat error:', error)
      
      // Remove loading message and show error
      setMessages(prev => prev.filter(msg => msg.id !== 'loading'))
      addMessage('bot', '❌ Sorry, I encountered an error. Please try again or rephrase your message.', true)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
      
      // Refocus input after response
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }
  }

  const generateReport = async () => {
    if (!canGenerateReport()) {
      toast.error('Need more conversation before generating report')
      return
    }

    setIsLoading(true)
    
    try {
      // Generate report from chat history
      const reportText = generateReportFromChat()
      
      // Create structured report object for ResultsDisplay
      const reportData = {
        status: 'success',
        analysis: reportText,
        processed_at: new Date().toISOString(),
        problem_statement: messages.find(msg => msg.sender === 'user')?.text || 'Problem not defined',
        methodology: '5 Whys Root Cause Analysis'
      }
      
      // Set report data and show results
      setGeneratedReport(reportData)
      setShowReport(true)
      
      // Add summary message to chat
      addMessage('bot', '✅ **Report Generated Successfully!** Your 5 Whys analysis report is now available below with copy and download options.', true)
      
      // Deduct credits for report generation
      await updateCredits(-cost)
      setReportCompleted(true)
      
      toast.success(`📊 5 Whys Report Generated! ${cost} credits used.`)
      
    } catch (error) {
      console.error('Report generation error:', error)
      toast.error('Failed to generate report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const startNewAnalysis = () => {
    setMessages([])
    setReportCompleted(false)
    setGeneratedReport(null)
    setShowReport(false)
    setSessionId(`${user.id}_${Date.now()}`)
    
    // Add fresh welcome message
    const welcomeMessage: Message = {
      id: 'welcome-new',
      sender: 'bot',
      text: `🔄 **Starting New Analysis**\n\nReady for another 5 Whys analysis! What problem would you like to explore?`,
      timestamp: new Date(),
      isHTML: true
    }
    setMessages([welcomeMessage])
  }

  const isInputDisabled = isLoading || !inputText.trim()

  return (
    <AgentLayout title={agentInfo.title} description={agentInfo.description} icon={agentInfo.icon} cost={cost}>
      <Toaster position="top-right" />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', gap: 'clamp(16px, 4vw, 24px)', minHeight: 'clamp(60vh, 70vh, 80vh)' }}>
        {/* Chat Interface */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          minHeight: 'clamp(50vh, 60vh, 70vh)'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 20px)',
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <h3 style={{ margin: 0, fontWeight: '600', fontSize: '18px' }}>
              🔍 5 Whys Analysis Chat
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Interactive root cause analysis powered by AI
            </p>
          </div>

          {/* Messages Container */}
          <div 
            ref={chatContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {message.isHTML ? (
                  <div
                    style={{
                      maxWidth: 'clamp(85%, 75%, 70%)',
                      padding: 'clamp(10px, 3vw, 12px) clamp(12px, 3vw, 16px)',
                      borderRadius: 'clamp(8px, 2vw, 12px)',
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      lineHeight: '1.5',
                      ...(message.sender === 'user' 
                        ? {
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white'
                          }
                        : {
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #e5e7eb'
                          }
                      )
                    }}
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  />
                ) : (
                  <div
                    style={{
                      maxWidth: 'clamp(85%, 75%, 70%)',
                      padding: 'clamp(10px, 3vw, 12px) clamp(12px, 3vw, 16px)',
                      borderRadius: 'clamp(8px, 2vw, 12px)',
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      lineHeight: '1.5',
                      ...(message.sender === 'user' 
                        ? {
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white'
                          }
                        : {
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #e5e7eb'
                          }
                      )
                    }}
                  >
                    {message.text}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: 'clamp(10px, 3vw, 12px) clamp(12px, 3vw, 16px)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  fontSize: 'clamp(12px, 3vw, 14px)'
                }}>
                  <span style={{ animation: 'pulse 1.5s infinite' }}>🤔 Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{
            padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 20px)',
            borderTop: '1px solid #e5e7eb',
            background: '#f9fafb'
          }}>
            <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', alignItems: 'center' }}>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: 'clamp(10px, 3vw, 12px) clamp(12px, 3vw, 16px)',
                  borderRadius: 'clamp(6px, 2vw, 8px)',
                  border: '1px solid #d1d5db',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  minHeight: '44px'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                onClick={sendMessage}
                disabled={isInputDisabled}
                style={{
                  padding: 'clamp(10px, 3vw, 12px) clamp(16px, 4vw, 20px)',
                  background: isInputDisabled ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isInputDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Send
              </button>
            </div>
            
            {/* Generate Report Button */}
            {canGenerateReport() && !reportCompleted && (
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={generateReport}
                  disabled={isLoading}
                  style={{
                    padding: '10px 20px',
                    background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                >
                  {isLoading ? '⏳ Generating...' : `📊 Generate Report (${cost} credits)`}
                </button>
              </div>
            )}
            
            {reportCompleted && (
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={startNewAnalysis}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Start New Analysis
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Credit Counter Sidebar */}
        <div>
          <CreditCounter 
            cost={cost} 
            onProcess={() => {
              if (canGenerateReport()) {
                generateReport()
              } else {
                toast.error('Need more conversation before generating report')
              }
            }} 
            disabled={!canGenerateReport() || reportCompleted} 
            processing={isLoading}
            customText={canGenerateReport() ? "Generate Report" : "Chat First"}
          />
          
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#d97706' }}>
              💡 How it works
            </h4>
            <ul style={{ margin: 0, fontSize: '12px', color: '#374151', lineHeight: '1.4', listStyle: 'none', paddingLeft: 0 }}>
              <li style={{ margin: '4px 0', paddingLeft: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#f59e0b' }}>•</span>
                Chat freely - no credits charged
              </li>
              <li style={{ margin: '4px 0', paddingLeft: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#f59e0b' }}>•</span>
                Click "Generate Report" to create final analysis
              </li>
              <li style={{ margin: '4px 0', paddingLeft: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#f59e0b' }}>•</span>
                Credits only deducted when report is generated
              </li>
              <li style={{ margin: '4px 0', paddingLeft: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#f59e0b' }}>•</span>
                Get professional 5 Whys methodology report
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom Report Display */}
      {showReport && generatedReport && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          marginTop: '24px'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '24px' }}>📊</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              5 Whys Analysis Report
            </h3>
            <div style={{
              background: '#10b981',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              marginLeft: 'auto'
            }}>
              ✅ Complete
            </div>
          </div>

          {/* Report Content */}
          <div 
            style={{
              fontSize: '16px',
              lineHeight: '1.6'
            }}
            dangerouslySetInnerHTML={{ __html: markdownToHTML(generatedReport.analysis) }}
          />

          {/* Download/Copy Actions */}
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={(e) => {
                // Button animation
                const button = e.currentTarget
                button.style.transform = 'scale(0.95)'
                button.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)'
                
                navigator.clipboard.writeText(generatedReport.analysis)
                toast.success('📋 Report copied to clipboard!')
                
                // Reset button after animation
                setTimeout(() => {
                  button.style.transform = 'scale(1)'
                  button.style.background = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                }, 150)
              }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              📋 Copy Report
            </button>
            
            <button
              onClick={(e) => {
                // Button animation
                const button = e.currentTarget
                button.style.transform = 'scale(0.95)'
                button.style.background = '#f3f4f6'
                
                const blob = new Blob([generatedReport.analysis], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `5-whys-analysis-${Date.now()}.md`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('💾 Markdown file downloaded!')
                
                // Reset button after animation
                setTimeout(() => {
                  button.style.transform = 'scale(1)'
                  button.style.background = 'white'
                }, 150)
              }}
              style={{
                background: 'white',
                color: '#374151',
                border: '2px solid #e5e7eb',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              💾 Download MD
            </button>

            <button
              onClick={(e) => {
                // Button animation
                const button = e.currentTarget
                button.style.transform = 'scale(0.95)'
                button.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                
                // Create a new window with the report content for PDF printing
                const reportContent = `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>5 Whys Analysis Report</title>
                    <style>
                      body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        line-height: 1.6; 
                        color: #1f2937;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 40px 20px;
                        background: white;
                      }
                      h1 { 
                        color: #1f2937; 
                        border-bottom: 3px solid #3b82f6; 
                        padding-bottom: 10px;
                        text-align: center;
                        font-size: 28px;
                        margin-bottom: 30px;
                      }
                      h2 { 
                        color: #1f2937; 
                        border-bottom: 2px solid #3b82f6; 
                        padding-bottom: 6px;
                        margin-top: 30px;
                        font-size: 22px;
                      }
                      h3 { 
                        color: #374151; 
                        border-bottom: 1px solid #e5e7eb; 
                        padding-bottom: 4px;
                        font-size: 18px;
                      }
                      blockquote {
                        border-left: 4px solid #3b82f6;
                        padding: 12px 16px;
                        margin: 16px 0;
                        background: #eff6ff;
                        font-style: italic;
                        color: #1e40af;
                        border-radius: 0 8px 8px 0;
                      }
                      strong { font-weight: 600; color: #1f2937; }
                      em { font-style: italic; color: #6b7280; }
                      ul, ol { margin: 12px 0; padding-left: 24px; }
                      li { margin: 6px 0; }
                      hr { 
                        border: none; 
                        border-top: 2px solid #e5e7eb; 
                        margin: 30px 0; 
                      }
                      @media print {
                        body { padding: 20px; }
                        h1 { page-break-after: avoid; }
                        h2, h3 { page-break-after: avoid; }
                      }
                    </style>
                  </head>
                  <body>
                    ${markdownToHTML(generatedReport.analysis)}
                  </body>
                  </html>
                `
                
                const printWindow = window.open('', '_blank')
                printWindow.document.write(reportContent)
                printWindow.document.close()
                
                // Wait for content to load then trigger print dialog
                printWindow.onload = () => {
                  setTimeout(() => {
                    printWindow.print()
                    toast.success('📄 Opening PDF save dialog...')
                  }, 500)
                }
                
                // Reset button after animation
                setTimeout(() => {
                  button.style.transform = 'scale(1)'
                  button.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                }, 150)
              }}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              📄 Save as PDF
            </button>
          </div>
        </div>
      )}
      {/* Mobile-specific styles for five-whys page */}
      <style jsx global>{`
        @media (max-width: 768px) {
          /* Chat interface mobile optimizations */
          div[style*="minHeight: 'clamp(50vh, 60vh, 70vh)"] {
            min-height: 60vh !important;
          }
          
          /* Better message wrapping on mobile */
          div[style*="maxWidth: 'clamp(85%, 75%, 70%)"] {
            max-width: 90% !important;
          }
          
          /* Stack action buttons vertically on small screens */
          div[style*="flexWrap: 'wrap'"] {
            flex-direction: column;
          }
          
          /* Ensure proper touch targets for mobile */
          button {
            min-height: 44px !important;
          }
          
          /* Better text readability on mobile */
          h1, h2, h3, h4, p {
            word-break: break-word;
          }
        }
        
        @media (max-width: 480px) {
          /* Very small screens */
          div[style*="padding: 'clamp"] {
            padding: 12px !important;
          }
          
          /* Single column layout on very small screens */
          div[style*="display: 'flex'"][style*="flexWrap: 'wrap'"] {
            flex-direction: column !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </AgentLayout>
  )
}

export default function FiveWhysPage() {
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
          Loading 5 Whys Chat...
        </div>
      </div>
    }>
      <FiveWhysChat />
    </Suspense>
  )
}