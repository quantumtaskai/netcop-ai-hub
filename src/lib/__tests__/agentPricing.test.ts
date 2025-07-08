/**
 * Agent Pricing Tests
 * 
 * Tests for agent pricing utilities to ensure correct
 * pricing calculations and agent information retrieval.
 */

import {
  AGENT_PRICING,
  getAgentPrice,
  getAllAgentPricing,
  getAgentsByCategory,
  calculateTotalPrice,
  formatPrice,
  getPriceTiers,
} from '../agentPricing'

describe('Agent Pricing Utilities', () => {
  describe('getAgentPrice', () => {
    it('should return correct agent price for valid slug', () => {
      const weatherAgent = getAgentPrice('weather-reporter')
      expect(weatherAgent).toBeTruthy()
      expect(weatherAgent?.price).toBe(2.00)
      expect(weatherAgent?.currency).toBe('AED')
      expect(weatherAgent?.slug).toBe('weather-reporter')
    })

    it('should return null for invalid slug', () => {
      const invalidAgent = getAgentPrice('non-existent-agent')
      expect(invalidAgent).toBe(null)
    })

    it('should return correct pricing for all implemented agents', () => {
      const implementedAgents = [
        'weather-reporter',
        'job-posting-generator', 
        'data-analyzer',
        'faq-generator',
        'social-ads-generator',
        'five-whys'
      ]

      implementedAgents.forEach(slug => {
        const agent = getAgentPrice(slug)
        expect(agent).toBeTruthy()
        expect(agent?.price).toBeGreaterThan(0)
        expect(agent?.currency).toBe('AED')
      })
    })
  })

  describe('getAllAgentPricing', () => {
    it('should return all agents sorted by price', () => {
      const agents = getAllAgentPricing()
      expect(agents.length).toBeGreaterThan(0)

      // Check if sorted by price (ascending)
      for (let i = 1; i < agents.length; i++) {
        expect(agents[i].price).toBeGreaterThanOrEqual(agents[i - 1].price)
      }
    })

    it('should include all required properties', () => {
      const agents = getAllAgentPricing()
      agents.forEach(agent => {
        expect(agent.id).toBeTruthy()
        expect(agent.name).toBeTruthy()
        expect(agent.price).toBeGreaterThan(0)
        expect(agent.currency).toBe('AED')
        expect(agent.description).toBeTruthy()
        expect(agent.category).toBeTruthy()
        expect(agent.slug).toBeTruthy()
        expect(Array.isArray(agent.features)).toBe(true)
        expect(agent.estimatedTime).toBeTruthy()
        expect(agent.priceDisplay).toBeTruthy()
      })
    })
  })

  describe('getAgentsByCategory', () => {
    it('should return agents filtered by category', () => {
      const analyticsAgents = getAgentsByCategory('analytics')
      expect(analyticsAgents.length).toBeGreaterThan(0)
      
      analyticsAgents.forEach(agent => {
        expect(agent.category).toBe('analytics')
      })
    })

    it('should return empty array for non-existent category', () => {
      const nonExistentCategory = getAgentsByCategory('non-existent')
      expect(nonExistentCategory).toEqual([])
    })

    it('should return agents sorted by price within category', () => {
      const contentAgents = getAgentsByCategory('content')
      if (contentAgents.length > 1) {
        for (let i = 1; i < contentAgents.length; i++) {
          expect(contentAgents[i].price).toBeGreaterThanOrEqual(contentAgents[i - 1].price)
        }
      }
    })
  })

  describe('calculateTotalPrice', () => {
    it('should calculate total price for multiple agents', () => {
      const agentSlugs = ['weather-reporter', 'data-analyzer']
      const total = calculateTotalPrice(agentSlugs)
      
      const weatherPrice = getAgentPrice('weather-reporter')?.price || 0
      const dataPrice = getAgentPrice('data-analyzer')?.price || 0
      const expectedTotal = weatherPrice + dataPrice
      
      expect(total).toBe(expectedTotal)
    })

    it('should return 0 for empty array', () => {
      const total = calculateTotalPrice([])
      expect(total).toBe(0)
    })

    it('should skip invalid agent slugs', () => {
      const agentSlugs = ['weather-reporter', 'invalid-agent', 'data-analyzer']
      const total = calculateTotalPrice(agentSlugs)
      
      const weatherPrice = getAgentPrice('weather-reporter')?.price || 0
      const dataPrice = getAgentPrice('data-analyzer')?.price || 0
      const expectedTotal = weatherPrice + dataPrice // invalid agent contributes 0
      
      expect(total).toBe(expectedTotal)
    })
  })

  describe('formatPrice', () => {
    it('should format price with default currency', () => {
      expect(formatPrice(5.00)).toBe('5.00 AED')
      expect(formatPrice(10.5)).toBe('10.50 AED')
    })

    it('should format price with custom currency', () => {
      expect(formatPrice(5.00, 'USD')).toBe('5.00 USD')
    })

    it('should handle zero and decimal prices', () => {
      expect(formatPrice(0)).toBe('0.00 AED')
      expect(formatPrice(2.99)).toBe('2.99 AED')
    })
  })

  describe('getPriceTiers', () => {
    it('should categorize agents into price tiers correctly', () => {
      const tiers = getPriceTiers()
      
      expect(tiers.low).toBeDefined()
      expect(tiers.medium).toBeDefined()
      expect(tiers.high).toBeDefined()

      // Check low tier (≤ 3 AED)
      tiers.low.forEach(agent => {
        expect(agent.price).toBeLessThanOrEqual(3)
      })

      // Check medium tier (4-6 AED)
      tiers.medium.forEach(agent => {
        expect(agent.price).toBeGreaterThan(3)
        expect(agent.price).toBeLessThanOrEqual(6)
      })

      // Check high tier (> 6 AED)
      tiers.high.forEach(agent => {
        expect(agent.price).toBeGreaterThan(6)
      })
    })

    it('should have at least one agent in each tier', () => {
      const tiers = getPriceTiers()
      
      expect(tiers.low.length).toBeGreaterThan(0)
      expect(tiers.medium.length).toBeGreaterThan(0)
      expect(tiers.high.length).toBeGreaterThan(0)
    })
  })

  describe('AGENT_PRICING constant', () => {
    it('should have correct pricing for implemented agents', () => {
      // Test specific pricing for implemented agents
      expect(AGENT_PRICING['weather-reporter'].price).toBe(2.00)
      expect(AGENT_PRICING['job-posting-generator'].price).toBe(4.00)
      expect(AGENT_PRICING['data-analyzer'].price).toBe(5.00)
      expect(AGENT_PRICING['faq-generator'].price).toBe(6.00)
      expect(AGENT_PRICING['social-ads-generator'].price).toBe(7.00)
      expect(AGENT_PRICING['five-whys'].price).toBe(8.00)
    })

    it('should have consistent data structure', () => {
      Object.values(AGENT_PRICING).forEach(agent => {
        expect(agent.id).toBeTruthy()
        expect(agent.name).toBeTruthy()
        expect(typeof agent.price).toBe('number')
        expect(agent.price).toBeGreaterThan(0)
        expect(agent.currency).toBe('AED')
        expect(agent.description).toBeTruthy()
        expect(agent.category).toBeTruthy()
        expect(agent.slug).toBeTruthy()
        expect(Array.isArray(agent.features)).toBe(true)
        expect(agent.features.length).toBeGreaterThan(0)
        expect(agent.estimatedTime).toBeTruthy()
        expect(agent.priceDisplay).toBeTruthy()
        expect(agent.priceDisplay).toContain('AED')
      })
    })

    it('should have price display matching actual price', () => {
      Object.values(AGENT_PRICING).forEach(agent => {
        const expectedDisplay = `${agent.price.toFixed(2)} AED`
        expect(agent.priceDisplay).toBe(expectedDisplay)
      })
    })
  })
})