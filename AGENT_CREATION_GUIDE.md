# 🛠️ NetCop AI Hub - Agent Creation Guide

## 📋 Overview
This guide provides a comprehensive, error-free process for creating new AI agents in the NetCop marketplace. Based on successful implementations of 5+ agents (Data Analyzer, Weather Reporter, 5 Whys Analysis, Job Posting Generator, Social Ads Generator), this plan eliminates common pitfalls and ensures consistent, professional implementation.

## ✨ Latest Updates (2025-01-02)
- ✅ **Social Ads Generator** - Complete marketing agent with platform-specific ad generation
- ✅ **Enhanced Download/Copy System** - Smart content extraction with clean filenames
- ✅ **Improved Results Display** - Automatic content detection and formatting
- ✅ **Better File Naming** - Platform-specific, descriptive download filenames

## 🎯 Complete Step-by-Step Implementation

### **Phase 1: Pre-Development Setup** ⏱️ 5-10 minutes

#### 1.1 Choose Agent Details
Before coding, define all agent characteristics:

```typescript
// Example Agent Definition
{
  name: "Content Writing Agent",           // Display name in marketplace
  slug: "content-writer",                  // URL slug (kebab-case)
  cost: 35,                               // Credits per use (15-45 typical)
  category: "content",                    // Category for filtering
  icon: "✍️",                             // Emoji for display
  initials: "CW",                         // 2-letter abbreviation
  gradient: "from-orange-500 to-red-600", // Tailwind gradient
  title: "Content Creation Studio",        // AgentLayout title
  description: "Generate blog posts, articles, and marketing content" // Brief description
}
```

#### 1.2 Integration Method Decision
Choose the appropriate integration pattern:

**Option A: N8N Webhook** (Most Common)
```typescript
// For AI processing, file analysis, content generation
const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_[AGENT_NAME]
const response = await fetch(webhookUrl, {
  method: 'POST',
  body: formData // or JSON
})
```

**Option B: External API** (Like Weather Reporter)
```typescript
// For third-party services
const apiKey = process.env.NEXT_PUBLIC_[SERVICE]_API_KEY
const response = await fetch(`https://api.service.com/endpoint`, {
  headers: { 'Authorization': `Bearer ${apiKey}` }
})
```

**Option C: Chat Interface** (Like 5 Whys)
```typescript
// For conversational agents with report generation
const [messages, setMessages] = useState<Message[]>([])
const [reportCompleted, setReportCompleted] = useState(false)
```

**Option D: Form-Based Marketing** (Like Social Ads Generator)
```typescript
// For marketing content generation with multiple inputs
const [formData, setFormData] = useState({
  description: '',
  platform: '',
  options: ''
})
```

#### 1.3 Environment Variables Setup
Add to `.env.example`:

```bash
# N8N Webhook URL for [Agent Name]
NEXT_PUBLIC_N8N_WEBHOOK_[AGENT_NAME]=https://your-n8n-instance.com/webhook/[agent-slug]

# OR External API Key
NEXT_PUBLIC_[SERVICE]_API_KEY=your_api_key_here
```

---

### **Phase 2: Core Implementation** ⏱️ 30-45 minutes

#### 2.1 Create Agent Page Structure
File: `/src/app/agent/[slug]/page.tsx`

```typescript
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

function [AgentName]Form() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateCredits } = useUserStore()
  
  // Get agent info from URL params
  const agentId = searchParams.get('agentId')
  const cost = parseInt(searchParams.get('cost') || '[DEFAULT_COST]')
  
  // Agent-specific state
  const [formData, setFormData] = useState({
    // Define your form fields here
  })
  
  // Component state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [results, setResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)

  // Get agent info
  const agentInfo = getAgentInfo('[agent-slug]')

  // Redirect if no user
  useEffect(() => {
    if (!user) router.push('/')
  }, [user, router])

  if (!user) return null

  // Form validation
  const isFormValid = () => {
    // Implement your validation logic
    return true
  }

  // Main processing function
  const processAgent = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsProcessing(true)
    setShowResults(false)
    setProcessingStatus('Processing...')

    try {
      // Your API/webhook integration here
      
      // Format results for display (IMPORTANT: use 'analysis' field)
      const formattedResults = {
        status: 'success',
        analysis: responseContent, // NOT jobPosting, content, etc.
        processed_at: new Date().toISOString(),
        // Add additional context for smart download/copy
        platform: formData.platform, // For social ads
        language: formData.language,  // For localization
        contentType: 'social-ad'      // Optional: helps with filename generation
      }

      setResults(formattedResults)
      setShowResults(true)

      // Deduct credits only on success
      await updateCredits(-cost)
      toast.success(`Task complete! ${cost} credits used.`)

    } catch (error: any) {
      console.error('Processing error:', error)
      
      // Specific error messages
      let errorMessage = 'Failed to process. Please try again.'
      if (error.message.includes('webhook not configured')) {
        errorMessage = 'Service is not properly configured.'
      } else if (error.message.includes('HTTP 404')) {
        errorMessage = 'Service is currently unavailable.'
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
          {/* Your form components here */}
          
          {showResults && results && (
            <ResultsDisplay 
              results={results} 
              title="Results" 
              isVisible={showResults} 
            />
          )}
        </div>

        <div>
          <CreditCounter 
            cost={cost} 
            onProcess={processAgent} 
            disabled={!isFormValid()} 
            processing={isProcessing}
          />
        </div>
      </div>
    </AgentLayout>
  )
}

export default function [AgentName]Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <[AgentName]Form />
    </Suspense>
  )
}
```

#### 2.2 Update Agent Utils
File: `/src/lib/agentUtils.ts`

```typescript
// Add to getAgentSlug function
'[Agent Display Name]': '[agent-slug]'

// Add to getAgentNameFromSlug function  
'[agent-slug]': '[Agent Display Name]'

// Add to getAgentInfo function
'[agent-slug]': {
  title: '[Display Title]',
  description: '[Brief description]',
  icon: '[Emoji]'
}
```

#### 2.3 Update Marketplace
File: `/src/app/marketplace/page.tsx`

Add to AGENTS array:
```typescript
{
  id: [NEXT_AVAILABLE_ID], // Check current highest ID + 1
  name: '[Agent Display Name]',
  description: '[Detailed description for marketplace card]',
  category: '[category]', // analytics, content, utilities, sales, etc.
  cost: [CREDIT_COST],
  rating: 4.8, // Use 4.6-4.9 range
  reviews: 1500, // Use realistic number
  initials: '[XX]', // 2-letter abbreviation
  gradient: 'from-[color]-500 to-[color]-600'
}
```

---

### **Phase 3: UI/UX Enhancements** ⏱️ 15-20 minutes

#### 3.1 Form Structure with Color-Coded Sections

```typescript
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
  {/* Form fields here */}
</div>

{/* Requirements Section */}
<div style={{
  marginBottom: spacing.xl,
  padding: spacing.md,
  backgroundColor: colors.primary[50],
  borderRadius: borderRadius.md,
  border: `1px solid ${colors.primary[100]}`
}}>
  <h4 style={{
    color: colors.primary[600],
    // ... other styles
  }}>
    Requirements
  </h4>
  {/* Form fields here */}
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
    color: colors.success[600],
    // ... other styles
  }}>
    Additional Details (Optional)
  </h4>
  {/* Optional fields here */}
</div>
```

#### 3.2 Form Input Styling

```typescript
// Standard input style
<input
  type="text"
  value={formData.fieldName}
  onChange={(e) => handleInputChange('fieldName', e.target.value)}
  disabled={isProcessing}
  style={{
    width: '100%',
    padding: spacing.sm,
    border: `2px solid ${colors.gray[200]}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    transition: transitions.normal,
    backgroundColor: colors.gray[50],
    minHeight: '44px' // Touch-friendly
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
```

#### 3.3 Enhanced Download/Copy System ✨ NEW
The ResultsDisplay component now includes smart content extraction for professional downloads:

**Automatic Features:**
- **Smart Content Detection**: Automatically extracts clean content from `results.analysis`
- **Intelligent File Naming**: Platform-specific filenames (e.g., `social-ad-facebook-{timestamp}.txt`)
- **Multiple Download Options**: Clean content + optional raw JSON for technical users
- **Proper MIME Types**: `.txt` for content, `.json` for data

**Agent-Specific Optimizations:**
```typescript
// Social Ads Generator results
{
  status: 'success',
  analysis: 'Ad Copy: 🚀 Your amazing ad content...',
  platform: 'Facebook',           // Used for filename: social-ad-facebook-{timestamp}.txt
  language: 'English',            // Additional context
  includesEmoji: true             // User preference tracking
}

// Job Posting Generator results  
{
  status: 'success',
  analysis: 'Job Title: Senior Developer\nAbout Us: ...',
  // Automatically detects job posting keywords → job-posting-{timestamp}.txt
}

// Weather Reporter results
{
  location: 'Dubai',
  current: { temperature: 28, ... },
  // Automatically generates weather summary → weather-report-dubai-{timestamp}.txt
}
```

**No Additional Code Needed**: The ResultsDisplay component handles everything automatically based on your results structure!

#### 3.4 Custom Results Display (if needed)
File: `/src/components/agent-shared/ResultsDisplay.tsx`

Add custom formatting logic:
```typescript
// Add in renderResults() function
if (results.[unique_property]) {
  return (
    <div style={{
      // Custom styling for your agent's results
    }}>
      {/* Custom JSX for beautiful result display */}
    </div>
  )
}
```

---

### **Phase 4: Testing & Validation** ⏱️ 10-15 minutes

#### 4.1 Core Functionality Checklist
- [ ] Form validation works correctly
- [ ] API/webhook integration functions
- [ ] Credit deduction only on success
- [ ] Error handling covers all scenarios
- [ ] Results display properly formatted

#### 4.2 User Experience Checklist
- [ ] Responsive design on mobile/desktop
- [ ] Processing status visible and informative
- [ ] Form disabled during processing
- [ ] All interactive elements have hover/focus states
- [ ] Copy/download functionality works

#### 4.3 Navigation Checklist
- [ ] Agent appears in marketplace with correct info
- [ ] Routing works from marketplace to agent
- [ ] Back button returns to marketplace
- [ ] All links function correctly

#### 4.4 Build Verification
```bash
npm run build
# Should compile without errors
```

---

## ⚠️ Common Pitfalls & Solutions

### 1. **Field Name Mismatch Error**
```typescript
// ❌ Wrong - will show raw JSON
const results = { status: 'success', content: data }

// ✅ Correct - will format properly
const results = { status: 'success', analysis: data }
```

### 2. **Design System Color Errors**
```typescript
// ❌ Wrong - doesn't exist
backgroundColor: colors.gray[25]

// ✅ Correct - use existing values
backgroundColor: colors.gray[50]
```

### 3. **Environment Variable Issues**
```bash
# Always add to .env.example with clear naming
NEXT_PUBLIC_N8N_WEBHOOK_[AGENT_NAME]=https://your-n8n-instance.com/webhook/[slug]
```

### 4. **Credit Deduction Timing**
```typescript
// ❌ Wrong - deducts before success
await updateCredits(-cost)
const response = await fetch(...)

// ✅ Correct - deducts after success
const response = await fetch(...)
const results = await response.json()
await updateCredits(-cost)
```

### 5. **Form Validation**
```typescript
// Always implement proper validation
const isFormValid = () => {
  return requiredField1.trim() && 
         requiredField2.trim() && 
         selectionField !== ''
}
```

---

## 🎨 Design System Reference

### Available Colors
```typescript
colors.gray[50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
colors.primary[50, 100, 500, 600, 700, 900]
colors.success[500, 600, 700]
colors.warning[500, 600, 700]
colors.danger[500, 600, 700]
```

### Available Spacing
```typescript
spacing.xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl
```

### Available Typography
```typescript
typography.fontSize.xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl
typography.fontWeight.light, normal, medium, semibold, bold
```

### Shared Components
- `AgentLayout` - Consistent page layout
- `FileUpload` - Drag & drop file upload
- `ProcessingStatus` - Animated processing indicator
- `ResultsDisplay` - Formatted results with copy/download
- `CreditCounter` - Credit validation and action button

---

## 📊 Integration Patterns

### N8N Webhook Pattern
```typescript
const formData = new FormData()
formData.append('file', selectedFile)
formData.append('userId', user.id)
formData.append('agentId', agentId)

const response = await fetch(webhookUrl, {
  method: 'POST',
  body: formData
})
```

### External API Pattern
```typescript
const response = await fetch(`https://api.service.com/endpoint`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestData)
})
```

### Chat Interface Pattern
```typescript
const [messages, setMessages] = useState<Message[]>([])
const [sessionId, setSessionId] = useState('')

const sendMessage = async () => {
  // Add user message
  const newMessages = [...messages, { role: 'user', content: inputText }]
  setMessages(newMessages)
  
  // Send to AI
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: inputText, sessionId })
  })
  
  // Add AI response
  const aiResponse = await response.json()
  setMessages([...newMessages, { role: 'assistant', content: aiResponse.response }])
}
```

### Marketing/Social Media Content Pattern ✨ NEW
**Perfect for Social Ads, Content Writing, Email Marketing agents**

```typescript
// Form-based content generation with multiple platform options
const [formData, setFormData] = useState({
  description: '',        // Main content description
  platform: '',          // Target platform (Facebook, Instagram, etc.)
  includeEmoji: '',       // Yes/No option
  language: 'English',    // Default language
  tone: '',              // Optional: Professional, Casual, etc.
  targetAudience: ''     // Optional: Demographics
})

// Create formatted message for N8N (matches test.html format)
const messageText = `Create a [content type] with the following details:

Description: ${formData.description}
Platform: ${formData.platform}
Include Emoji: ${formData.includeEmoji}
Language: ${formData.language}

Please create engaging, platform-optimized content based on this information.`

// N8N webhook payload
const webhookPayload = {
  message: { text: messageText },
  sessionId: `${contentType}_${Date.now()}`
}

// Handle N8N response format: [{"output": "content..."}]
const responseData = await response.json()
let content = ''
if (Array.isArray(responseData) && responseData[0]?.output) {
  content = responseData[0].output
}

// Format for enhanced download system
const formattedResults = {
  status: 'success',
  analysis: content,              // Clean content for download
  platform: formData.platform,   // Used for filename generation
  language: formData.language,    // Additional context
  processed_at: new Date().toISOString()
}
```

**Key Features:**
- ✅ Multi-section form with color-coded categories
- ✅ Platform-specific content generation
- ✅ Smart filename generation (`social-ad-facebook-{timestamp}.txt`)
- ✅ Clean content downloads (no JSON metadata)
- ✅ Professional marketing theme with pink/rose gradients

---

## 🚀 Success Criteria

An agent is considered successfully implemented when:

✅ **Functionality**
- Agent loads without errors
- Form validation works correctly  
- API integration functions properly
- Credit system operates as expected
- Error handling provides specific feedback

✅ **User Experience**
- UI/UX meets quality standards
- Results display beautifully
- Mobile responsiveness maintained
- Processing states are clear
- Navigation works seamlessly
- **Download/Copy functionality provides clean content** ✨ NEW
- **Smart filename generation works correctly** ✨ NEW

✅ **Code Quality**
- Follows established patterns
- Uses design system consistently
- Includes proper TypeScript typing
- Has comprehensive error handling
- Maintains consistent styling

---

## 📝 Post-Implementation Checklist

1. **Update Documentation**
   - Add agent details to `CLAUDE.md`
   - Document any custom features
   - Note integration specifics

2. **Commit Changes**
   ```bash
   git add .
   git commit -m "Implement [Agent Name] with [key features]"
   git push
   ```

3. **N8N Workflow Setup** (if applicable)
   - Configure corresponding N8N workflow
   - Test webhook endpoint
   - Verify response format

4. **Environment Setup**
   - Add production environment variables
   - Test in staging environment
   - Verify all integrations work

---

## 🔧 Available Agent Slots

**Implemented Agents:**
1. ✅ 5 Whys Analysis Agent (ID: 1)
2. ✅ Data Analysis Agent (ID: 2)  
3. ✅ Weather Reporter Agent (ID: 3)
4. ✅ Job Posting Generator Agent (ID: 9)
5. ✅ Social Ads Generator Agent (ID: 10)

**Ready for Implementation:**
- Smart Customer Support Agent (ID: 4)
- Content Writing Agent (ID: 5)
- Email Automation Agent (ID: 6)
- Sales Assistant Agent (ID: 7)
- Task Automation Agent (ID: 8)

**Next Available ID:** 11

---

## 🎯 Successful Implementation Examples

### **Social Ads Generator Agent** ✨ LATEST
**Category**: Marketing | **Cost**: 25 credits | **Pattern**: Form-based N8N integration

**Key Features Implemented:**
- ✅ **Multi-section form**: Content Information (blue theme) + Platform & Formatting (purple theme)
- ✅ **Platform-specific targeting**: Facebook, Instagram, LinkedIn, X (Twitter)
- ✅ **Smart content extraction**: Downloads as `social-ad-facebook-{timestamp}.txt`
- ✅ **N8N integration**: Sends formatted message text to webhook
- ✅ **Response handling**: Extracts content from `[{"output": "..."}]` format
- ✅ **Professional results**: Clean ad copy display with copy/download options

**Implementation Highlights:**
```typescript
// Form structure with validation
const isFormValid = () => {
  return formData.description.trim() && 
         formData.includeEmoji && 
         formData.socialPlatform &&
         formData.language.trim()
}

// N8N payload format (matches test.html)
const webhookPayload = {
  message: { text: messageText },
  sessionId: `social_ad_${Date.now()}`
}

// Results optimized for download system
const formattedResults = {
  status: 'success',
  analysis: adContent,                // Clean content
  platform: formData.socialPlatform, // Used for filename
  language: formData.language,        // Additional context
  processed_at: new Date().toISOString()
}
```

### **5 Whys Analysis Agent**
**Category**: Analytics | **Cost**: 30 credits | **Pattern**: Chat interface

**Key Features:**
- ✅ Real-time conversation with AI-powered analysis
- ✅ Smart credit system (free chat, paid report generation)
- ✅ Professional report generation with structured sections
- ✅ Custom markdown-to-HTML conversion for beautiful display

### **Data Analyzer Agent**
**Category**: Analytics | **Cost**: 45 credits | **Pattern**: File upload + N8N

**Key Features:**
- ✅ File upload component (PDF, CSV, Excel up to 25MB)
- ✅ Analysis type selection (Summary, Trends, Insights, Full)
- ✅ FormData upload to N8N webhook
- ✅ Comprehensive error handling for file processing

### **Weather Reporter Agent**
**Category**: Utilities | **Cost**: 15 credits | **Pattern**: External API

**Key Features:**
- ✅ Location input with geocoding support
- ✅ OpenWeatherMap API integration (no N8N required)
- ✅ Beautiful weather display with icons and forecast cards
- ✅ Custom weather summary formatting for downloads

### **Job Posting Generator Agent**
**Category**: Content | **Cost**: 25 credits | **Pattern**: Form-based N8N

**Key Features:**
- ✅ Comprehensive job posting form with multiple sections
- ✅ Color-coded form sections for better UX
- ✅ Professional job posting formatting
- ✅ Smart content detection for job-specific downloads

---

## 💡 Tips for Success

1. **Start with Simple Agents**: Begin with straightforward form-based agents before attempting complex chat interfaces

2. **Use Existing Patterns**: 
   - **Marketing/Content Agents**: Copy Social Ads Generator structure
   - **Form-based Agents**: Use Job Posting Generator pattern
   - **Chat Agents**: Follow 5 Whys Analysis implementation
   - **API Integrations**: Reference Weather Reporter for external APIs

3. **Test Early**: Validate form functionality before implementing API integration

4. **Follow the Checklist**: Use Phase 4 testing checklist to ensure nothing is missed

5. **Consistent Naming**: Keep agent names, slugs, and file names consistent throughout

6. **Design System First**: Always use design system tokens instead of hardcoded values

7. **Results Structure**: Always use `analysis` field for content to enable smart downloads ✨ NEW

8. **Platform Context**: Include platform/language fields for better filename generation ✨ NEW

9. **Test Downloads**: Verify copy/download functionality provides clean content, not JSON ✨ NEW

10. **Color-Coded Sections**: Use different background colors for form sections to improve UX ✨ NEW

This guide ensures error-free, professional agent implementation following established NetCop AI Hub patterns and standards. The latest enhancements focus on user experience improvements and intelligent content handling.