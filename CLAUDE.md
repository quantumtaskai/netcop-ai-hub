# NetCop AI Hub - Development Guide

## Project Overview
NetCop AI agent marketplace where users can use various AI agents using a wallet balance system (AED currency). Each agent redirects to its own page with custom functionality connected to n8n workflows.

## 🏗️ Technical Architecture

### Frontend Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Zustand** - State management for user sessions and wallet balance
- **React Hot Toast** - Toast notifications for user feedback
- **Inline CSS** - Component-specific styling with gradients and animations

### Backend & Infrastructure
- **Supabase** - Authentication, database, and real-time subscriptions
- **Stripe Payment Links** - Wallet top-up processing with AED currency
- **N8N** - Workflow automation for agent processing
- **OpenWeatherMap API** - External API integration example

### Data Flow
1. **Authentication**: Supabase Auth → User session → Zustand store
2. **Wallet Top-Up**: Stripe Payment Links → Payment verification → Wallet balance update
3. **Agent Usage**: Wallet validation → Agent processing → AED deduction → Transaction recording
4. **Results**: N8N/API response → Formatted display → Copy/download options

## 🎯 Wallet System Status: ✅ PRODUCTION READY

### **Major System Transformation: Credits → Wallet Balance**
- **Database**: Fresh schema with `wallet_balance` (DECIMAL) and `wallet_transactions` table
- **Pricing**: Direct AED pricing (2.00-8.00 AED per agent) via `agentPricing.ts`
- **Components**: Complete `WalletBalance` system replacing credit logic
- **User Experience**: Transparent pricing, easy top-ups, clear balance display
- **Authentication**: Auto-profile creation, RLS policies fixed

### **Database Schema**
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT CHECK (type IN ('top_up', 'agent_usage', 'refund')),
    description TEXT,
    agent_slug TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🤖 Active Agents: 6 Agents Implemented

### **Implemented Agents**
- **Data Analyzer**: File analysis with comprehensive insights (5.00 AED)
- **Weather Reporter**: Location-based weather reports (2.00 AED)
- **5 Whys Analysis**: Interactive root cause analysis (8.00 AED)
- **FAQ Generator**: Automated FAQ creation (3.00 AED)
- **Social Ads Generator**: Marketing content creation (4.00 AED)
- **Job Posting Generator**: Professional job descriptions (3.00 AED)

### **Agent Architecture**
- **Shared Components**: `AgentLayout`, `WalletBalance`, `ProcessingStatus`, `ResultsDisplay`, `FileUpload`
- **Individual Pages**: `/app/agent/[slug]/page.tsx` pattern
- **Centralized Routing**: `agentUtils.ts` for slug mapping and metadata
- **Consistent Pricing**: `agentPricing.ts` configuration

### **Agent Slug Mapping**
```typescript
// Implemented agents
'data-analyzer' ✅
'weather-reporter' ✅  
'five-whys' ✅
'faq-generator' ✅
'social-ads-generator' ✅
'job-posting-generator' ✅

// Future agents
'customer-support'
'content-writer'
'email-automation'
'sales-assistant'
'task-automation'
```

## 💳 Stripe Payment System

### **Wallet Top-Up Packages**
| Package | Amount (AED) | Price (AED) | Usage |
|---------|--------------|-------------|-------|
| Basic | 10 | 9.99 | Testing/trial users |
| Popular | 50 | 49.99 | Regular users |
| Premium | 100 | 99.99 | Power users |
| Enterprise | 500 | 499.99 | Business/team usage |

### **Implementation**
```typescript
// userStore.ts - topUpWallet()
topUpWallet: (amount: number) => {
  const paymentLinks = {
    10: 'https://buy.stripe.com/test_28EbJ16AA7ly3ic7vh2VG0a',
    50: 'https://buy.stripe.com/test_4gM00jbUUgW83ic3f12VG0b', 
    100: 'https://buy.stripe.com/test_aFadR99MM35ibOI6rd2VG0c',
    500: 'https://buy.stripe.com/test_14AbJ12kk7lyf0U16T2VG0d'
  }
  const paymentLink = paymentLinks[amount]
  const url = `${paymentLink}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`
  window.open(url, '_blank')
}
```

## 🔧 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# N8N Webhooks
NEXT_PUBLIC_N8N_WEBHOOK_DATA_ANALYZER=https://your-n8n-instance.com/webhook/data-analyzer
NEXT_PUBLIC_N8N_WEBHOOK_FIVE_WHYS=https://quantumtaskai.app.n8n.cloud/webhook/5-whys-web
NEXT_PUBLIC_N8N_WEBHOOK_JOB_POSTING=https://quantumtaskai.app.n8n.cloud/webhook/43f84411-eaaa-488c-9b1f-856e90d0aaf6

# External APIs
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key

# Stripe (Optional - Payment Links are hardcoded)
# STRIPE_SECRET_KEY=sk_test_... (for webhook processing)
# STRIPE_WEBHOOK_SECRET=whsec_... (for webhook verification)
```

## 🔧 AI Agent Creation Guide

### **Required Files & Components**

#### 1. Agent Page (`/src/app/agent/[slug]/page.tsx`)
```typescript
'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { getAgentInfo } from '@/lib/agentUtils'
import AgentLayout from '@/components/agent-shared/AgentLayout'
import ProcessingStatus from '@/components/agent-shared/ProcessingStatus'
import ResultsDisplay from '@/components/agent-shared/ResultsDisplay'
import WalletBalance from '@/components/agent-shared/WalletBalance'

export default function AgentPage() {
  const router = useRouter()
  const { user, updateWalletBalance } = useUserStore()
  const agentInfo = getAgentInfo('agent-slug')
  
  // Agent-specific state
  const [inputData, setInputData] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const processAgent = async () => {
    setIsProcessing(true)
    try {
      // API call or webhook integration
      const response = await fetch('API_ENDPOINT', {
        method: 'POST',
        // request configuration
      })
      const results = await response.json()
      setResults(results)
      setShowResults(true)
      
      // Deduct wallet balance only on success
      await updateWalletBalance(-agentInfo.price)
      toast.success(`Task complete! ${agentInfo.price} AED used.`)
    } catch (error) {
      toast.error('Failed to process. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AgentLayout title={agentInfo.title} description={agentInfo.description}>
      <Toaster position="top-right" />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        <div>
          {/* Agent-specific input components */}
          <ProcessingStatus isProcessing={isProcessing} />
          {showResults && results && (
            <ResultsDisplay results={results} title="Results" isVisible={showResults} />
          )}
        </div>
        <div>
          <WalletBalance agentSlug="agent-slug" onProcess={processAgent} disabled={!inputData} processing={isProcessing} />
        </div>
      </div>
    </AgentLayout>
  )
}
```

#### 2. Update Agent Utils (`/src/lib/agentUtils.ts`)
```typescript
// Add to getAgentSlug function
'Agent Name': 'agent-slug'

// Add to getAgentInfo function
'agent-slug': {
  title: 'Display Title',
  description: 'Brief description',
  icon: '🤖'
}
```

#### 3. Update Marketplace (`/src/app/marketplace/page.tsx`)
```typescript
// Add to AGENTS array
{
  id: NEXT_ID,
  name: 'Agent Name',
  description: 'Detailed description for card',
  category: 'category',
  cost: PRICE_IN_AED,
  rating: 4.8,
  reviews: 1500,
  initials: 'XX',
  gradient: 'from-color-500 to-color-600'
}
```

#### 4. Update Agent Pricing (`/src/lib/agentPricing.ts`)
```typescript
export const AGENT_PRICING: Record<string, AgentPrice> = {
  'agent-slug': { price: X.XX, priceDisplay: 'X.XX AED' }
}
```

### **Integration Patterns**

#### N8N Webhook Pattern
```typescript
const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_AGENT_NAME
const formData = new FormData()
formData.append('file', selectedFile)
formData.append('userId', user.id)

const response = await fetch(webhookUrl, {
  method: 'POST',
  body: formData
})
```

#### External API Pattern
```typescript
const apiKey = process.env.NEXT_PUBLIC_SERVICE_API_KEY
const response = await fetch(`https://api.service.com/endpoint`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestData)
})
```

### **Pricing Guidelines**
- **Simple text processing**: 2.00-3.00 AED
- **File analysis**: 4.00-6.00 AED  
- **Complex AI operations**: 6.00-8.00 AED
- **API-heavy operations**: 3.00-5.00 AED

## 🎨 UI/UX Architecture

### **Shared Components System**
- **Header/Footer**: Unified navigation and branding across all pages (`/src/components/shared/`)
- **Agent Layout**: Consistent agent page template (`/src/components/agent-shared/AgentLayout.tsx`)
- **Design System**: Centralized tokens and utilities (`/src/lib/designSystem.ts`, `/src/lib/styleUtils.ts`)

### **Key Features**
- **80px logo consistency** across all pages
- **Glassmorphism design** with backdrop blur effects
- **Responsive design** using clamp() functions for fluid scaling
- **Touch-friendly interfaces** with 48px minimum touch targets
- **Wallet balance validation** before processing
- **Professional gradient backgrounds** and animations

### **Pricing Page (`/src/app/pricing/page.tsx`)** ✨ *Recently Enhanced*
- **Modern Card Design**: Enhanced glassmorphism with unique icons (💰⭐🚀👑) per tier
- **Color-Coded Packages**: Custom gradient schemes for visual differentiation
- **Value Proposition Section**: Highlighted benefits (⚡ Instant Results, 🎯 Transparent Pricing, 🔄 No Expiration)
- **Enhanced UX**: Interactive usage examples showing AI operation estimates
- **CSS-Only Animations**: Reliable hover effects without JavaScript dependencies
- **Mobile-Optimized**: Improved touch targets and responsive scaling
- **Clean Layout**: Simplified headers and removed redundant text for minimal design
- **Updated FAQ**: AED pricing explanations replacing legacy credit references
- **Footer Integration**: Complete page layout with company information
- **Runtime Stable**: Fixed all TypeError issues with transform properties

## 🚀 Development Workflow

### **Adding New Agents**
1. Create agent page in `/src/app/agent/[slug]/page.tsx`
2. Update `agentUtils.ts` with slug mapping and metadata
3. Add agent to marketplace `AGENTS` array
4. Configure pricing in `agentPricing.ts`
5. Add environment variables if needed
6. Test end-to-end flow: wallet validation → processing → deduction

### **Quality Checklist**
- [ ] Agent page renders correctly with all components
- [ ] Wallet balance validation works
- [ ] Processing status updates provide clear feedback
- [ ] Error handling covers all failure scenarios
- [ ] Wallet balance deduction only occurs on successful completion
- [ ] Results display beautifully with copy/download options
- [ ] Agent appears on marketplace with correct information
- [ ] Environment variables documented

### **Testing Commands**
```bash
npm run build     # Verify build passes
npm run dev       # Local development
npm run lint      # Code quality check
npm run typecheck # TypeScript validation
```

---

## Current Status: Production Ready ✅

The application features a **robust, transparent, and user-friendly wallet system** with:
- **6 active AI agents** with direct AED pricing
- **Complete payment integration** via Stripe Payment Links
- **Enhanced pricing page** with modern UI/UX and runtime-stable interactions
- **Unified design system** with shared components and glassmorphism effects
- **Scalable architecture** for rapid agent development
- **Production-ready** wallet system with transaction history

### **Latest Enhancements (v2.1.0)**
- **Modern Pricing Page**: Redesigned with glassmorphism, unique icons, and enhanced UX
- **CSS-Only Animations**: Eliminated JavaScript runtime errors with pure CSS hover effects
- **Mobile-First Design**: Optimized touch targets and responsive scaling
- **Value-Driven Copy**: Clear benefits and transparent AED pricing throughout

Users start with 0.00 AED balance and can easily understand exactly what they're paying for each AI agent through the beautifully designed pricing interface.