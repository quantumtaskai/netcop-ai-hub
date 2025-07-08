import { getAgentPrice } from './agentPricing'

// Agent slug mapping utility
export const getAgentSlug = (agentName: string): string => {
  const slugMap: { [key: string]: string } = {
    'Smart Customer Support Agent': 'customer-support',
    'Data Analysis Agent': 'data-analyzer', 
    'Content Writing Agent': 'content-writer',
    'Email Automation Agent': 'email-automation',
    'Sales Assistant Agent': 'sales-assistant',
    'Task Automation Agent': 'task-automation',
    'Weather Reporter Agent': 'weather-reporter',
    '5 Whys Analysis Agent': 'five-whys',
    'Job Posting Generator Agent': 'job-posting-generator',
    'Social Ads Generator Agent': 'social-ads-generator',
    'FAQ Generator Agent': 'faq-generator'
  }
  
  return slugMap[agentName] || 'default-agent'
}

// Reverse mapping for getting agent name from slug
export const getAgentNameFromSlug = (slug: string): string => {
  const nameMap: { [key: string]: string } = {
    'customer-support': 'Smart Customer Support Agent',
    'data-analyzer': 'Data Analysis Agent',
    'content-writer': 'Content Writing Agent', 
    'email-automation': 'Email Automation Agent',
    'sales-assistant': 'Sales Assistant Agent',
    'task-automation': 'Task Automation Agent',
    'weather-reporter': 'Weather Reporter Agent',
    'five-whys': '5 Whys Analysis Agent',
    'job-posting-generator': 'Job Posting Generator Agent',
    'social-ads-generator': 'Social Ads Generator Agent',
    'faq-generator': 'FAQ Generator Agent'
  }
  
  return nameMap[slug] || 'Unknown Agent'
}

// Get agent display information
export const getAgentInfo = (slug: string) => {
  const agentInfo: { [key: string]: { title: string, description: string, icon: string } } = {
    'customer-support': {
      title: 'Customer Support Assistant',
      description: 'AI-powered customer inquiry processing and response generation',
      icon: '💬'
    },
    'data-analyzer': {
      title: 'Data Analysis Engine', 
      description: 'Upload spreadsheets and get insights, charts, and analysis',
      icon: '📊'
    },
    'content-writer': {
      title: 'Content Creation Studio',
      description: 'Generate blog posts, articles, and marketing content',
      icon: '✍️'
    },
    'email-automation': {
      title: 'Email Campaign Manager',
      description: 'Create and manage automated email marketing campaigns',
      icon: '📧'
    },
    'sales-assistant': {
      title: 'Sales Pipeline Manager',
      description: 'Lead qualification and sales process automation',
      icon: '💰'
    },
    'task-automation': {
      title: 'Workflow Automation Hub',
      description: 'Connect apps and automate repetitive tasks',
      icon: '⚡'
    },
    'weather-reporter': {
      title: 'Weather Reporter',
      description: 'Get detailed weather reports for any location worldwide',
      icon: '🌤️'
    },
    'five-whys': {
      title: '5 Whys Root Cause Analyzer',
      description: 'Systematic root cause analysis using the proven 5 Whys methodology',
      icon: '🔍'
    },
    'job-posting-generator': {
      title: 'Job Posting Generator',
      description: 'Create professional job postings with AI-powered content generation',
      icon: '📝'
    },
    'social-ads-generator': {
      title: 'Social Ads Studio',
      description: 'Create engaging social media advertisements with AI-powered content generation',
      icon: '📱'
    },
    'faq-generator': {
      title: 'FAQ Generator',
      description: 'Generate comprehensive FAQs from files or URLs with AI-powered content analysis',
      icon: '❓'
    }
  }
  
  return agentInfo[slug] || {
    title: 'AI Agent',
    description: 'AI-powered automation tool',
    icon: '🤖'
  }
}

// Get complete agent information including pricing
export const getAgentWithPricing = (slug: string) => {
  const agentInfo = getAgentInfo(slug)
  const agentPrice = getAgentPrice(slug)
  
  return {
    ...agentInfo,
    pricing: agentPrice,
    hasPayPerUse: !!agentPrice
  }
}

// Check if agent supports pay-per-use pricing
export const supportsPayPerUse = (slug: string): boolean => {
  return !!getAgentPrice(slug)
}

// Get formatted price display for agent
export const getAgentPriceDisplay = (slug: string): string => {
  const pricing = getAgentPrice(slug)
  return pricing ? pricing.priceDisplay : 'Pricing not available'
}