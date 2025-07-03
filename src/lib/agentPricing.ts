/**
 * Agent Pricing Configuration for Pay-per-Use System
 * 
 * This file defines the direct pricing for each AI agent.
 * Users pay directly for each agent use instead of using credits.
 */

export interface AgentPrice {
  id: string
  name: string
  price: number           // Price in AED
  currency: 'AED'
  description: string
  category: string
  slug: string
  features: string[]
  estimatedTime: string   // How long the agent takes to complete
  priceDisplay: string    // Formatted price for display
}

export const AGENT_PRICING: Record<string, AgentPrice> = {
  'weather-reporter': {
    id: 'weather-reporter',
    name: 'Weather Reporter Agent',
    price: 2.00,
    currency: 'AED',
    description: 'Get comprehensive weather reports and forecasts for any location worldwide',
    category: 'utilities',
    slug: 'weather-reporter',
    features: ['Current weather conditions', '5-day forecast', 'Weather alerts', 'Multiple locations'],
    estimatedTime: '10 seconds',
    priceDisplay: '2.00 AED'
  },
  
  'job-posting-generator': {
    id: 'job-posting-generator',
    name: 'Job Posting Generator Agent',
    price: 4.00,
    currency: 'AED',
    description: 'Create professional job postings with detailed requirements and company culture',
    category: 'content',
    slug: 'job-posting-generator',
    features: ['Professional job descriptions', 'Requirements analysis', 'Company culture integration', 'SEO optimization'],
    estimatedTime: '30 seconds',
    priceDisplay: '4.00 AED'
  },

  'data-analyzer': {
    id: 'data-analyzer',
    name: 'Data Analysis Agent',
    price: 5.00,
    currency: 'AED',
    description: 'Analyze your data files (PDF, CSV, Excel) and generate comprehensive insights',
    category: 'analytics',
    slug: 'data-analyzer',
    features: ['File analysis (PDF, CSV, Excel)', 'Statistical insights', 'Data visualization', 'Trend analysis'],
    estimatedTime: '45 seconds',
    priceDisplay: '5.00 AED'
  },

  'faq-generator': {
    id: 'faq-generator',
    name: 'FAQ Generator Agent',
    price: 6.00,
    currency: 'AED',
    description: 'Generate comprehensive FAQ content from documents or website content',
    category: 'content',
    slug: 'faq-generator',
    features: ['Document analysis', 'Question generation', 'Answer creation', 'SEO-friendly format'],
    estimatedTime: '40 seconds',
    priceDisplay: '6.00 AED'
  },

  'social-ads-generator': {
    id: 'social-ads-generator',
    name: 'Social Ads Generator Agent',
    price: 7.00,
    currency: 'AED',
    description: 'Create compelling social media advertisements with copy and targeting suggestions',
    category: 'marketing',
    slug: 'social-ads-generator',
    features: ['Ad copy generation', 'Platform optimization', 'Audience targeting', 'A/B test variants'],
    estimatedTime: '35 seconds',
    priceDisplay: '7.00 AED'
  },

  'five-whys': {
    id: 'five-whys',
    name: '5 Whys Analysis Agent',
    price: 8.00,
    currency: 'AED',
    description: 'Conduct systematic root cause analysis using the proven 5 Whys methodology',
    category: 'analytics',
    slug: 'five-whys',
    features: ['Interactive chat analysis', 'Root cause identification', 'Professional report generation', 'Implementation roadmap'],
    estimatedTime: '2-5 minutes',
    priceDisplay: '8.00 AED'
  },

  'customer-support': {
    id: 'customer-support',
    name: 'Smart Customer Support Agent',
    price: 3.00,
    currency: 'AED',
    description: 'Automate customer inquiries with intelligent responses and high satisfaction rates',
    category: 'customer-service',
    slug: 'customer-support',
    features: ['Automated responses', 'Multi-language support', 'Ticket management', 'Satisfaction tracking'],
    estimatedTime: '20 seconds',
    priceDisplay: '3.00 AED'
  },

  'content-writer': {
    id: 'content-writer',
    name: 'Content Writing Agent',
    price: 5.00,
    currency: 'AED',
    description: 'Generate high-quality content for blogs, articles, and marketing materials',
    category: 'content',
    slug: 'content-writer',
    features: ['Blog writing', 'SEO optimization', 'Multiple formats', 'Brand voice matching'],
    estimatedTime: '45 seconds',
    priceDisplay: '5.00 AED'
  },

  'email-automation': {
    id: 'email-automation',
    name: 'Email Automation Agent',
    price: 4.00,
    currency: 'AED',
    description: 'Create and manage automated email campaigns with personalization',
    category: 'marketing',
    slug: 'email-automation',
    features: ['Campaign creation', 'Personalization', 'A/B testing', 'Analytics tracking'],
    estimatedTime: '30 seconds',
    priceDisplay: '4.00 AED'
  },

  'sales-assistant': {
    id: 'sales-assistant',
    name: 'Sales Assistant Agent',
    price: 6.00,
    currency: 'AED',
    description: 'Streamline sales processes with lead qualification and proposal generation',
    category: 'sales',
    slug: 'sales-assistant',
    features: ['Lead qualification', 'Proposal generation', 'Follow-up automation', 'Pipeline management'],
    estimatedTime: '40 seconds',
    priceDisplay: '6.00 AED'
  },

  'task-automation': {
    id: 'task-automation',
    name: 'Task Automation Agent',
    price: 7.00,
    currency: 'AED',
    description: 'Automate repetitive business tasks and workflow optimization',
    category: 'utilities',
    slug: 'task-automation',
    features: ['Workflow automation', 'Task scheduling', 'Process optimization', 'Integration support'],
    estimatedTime: '50 seconds',
    priceDisplay: '7.00 AED'
  }
}

/**
 * Get pricing information for a specific agent
 */
export function getAgentPrice(agentSlug: string): AgentPrice | null {
  return AGENT_PRICING[agentSlug] || null
}

/**
 * Get all agent pricing sorted by price (lowest to highest)
 */
export function getAllAgentPricing(): AgentPrice[] {
  return Object.values(AGENT_PRICING).sort((a, b) => a.price - b.price)
}

/**
 * Get agents by category with pricing
 */
export function getAgentsByCategory(category: string): AgentPrice[] {
  return Object.values(AGENT_PRICING)
    .filter(agent => agent.category === category)
    .sort((a, b) => a.price - b.price)
}

/**
 * Calculate total price for multiple agent uses
 */
export function calculateTotalPrice(agentSlugs: string[]): number {
  return agentSlugs.reduce((total, slug) => {
    const agent = getAgentPrice(slug)
    return total + (agent?.price || 0)
  }, 0)
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'AED'): string {
  return `${price.toFixed(2)} ${currency}`
}

/**
 * Get price tiers for comparison display
 */
export function getPriceTiers(): { low: AgentPrice[], medium: AgentPrice[], high: AgentPrice[] } {
  const agents = getAllAgentPricing()
  
  return {
    low: agents.filter(agent => agent.price <= 3),      // 2-3 AED
    medium: agents.filter(agent => agent.price > 3 && agent.price <= 6), // 4-6 AED  
    high: agents.filter(agent => agent.price > 6)       // 7-8 AED
  }
}

/**
 * Legacy: Map old credit costs to new AED pricing
 * This helps with migration from credit system
 */
export const CREDIT_TO_PRICE_MAPPING = {
  15: 2.00,  // Weather Reporter: 15 credits → 2 AED
  20: 4.00,  // Email Automation: 20 credits → 4 AED
  25: 3.00,  // Customer Support: 25 credits → 3 AED (updated)
  30: 8.00,  // 5 Whys: 30 credits → 8 AED
  35: 7.00,  // Task Automation: 35 credits → 7 AED
  40: 6.00,  // Sales Assistant: 40 credits → 6 AED
  45: 5.00,  // Data Analyzer: 45 credits → 5 AED
  50: 5.00   // Content Writer: 50 credits → 5 AED
} as const

export type AgentSlug = keyof typeof AGENT_PRICING