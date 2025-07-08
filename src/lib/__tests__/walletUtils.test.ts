/**
 * Wallet Utils Tests
 * 
 * Tests for wallet utility functions to ensure payment
 * and balance calculations work correctly.
 */

import {
  WALLET_PACKAGES,
  hasSufficientBalance,
  formatWalletBalance,
  getWalletStatus,
  calculateUsageCount,
  getRecommendedTopUp,
  getWalletPackage,
  calculateTotalAmount,
  validateWalletBalance,
  TransactionDescriptions,
} from '../walletUtils'

describe('Wallet Utilities', () => {
  describe('hasSufficientBalance', () => {
    it('should return true when balance is sufficient', () => {
      expect(hasSufficientBalance(10, 5)).toBe(true)
      expect(hasSufficientBalance(10, 10)).toBe(true)
    })

    it('should return false when balance is insufficient', () => {
      expect(hasSufficientBalance(5, 10)).toBe(false)
      expect(hasSufficientBalance(0, 1)).toBe(false)
    })
  })

  describe('formatWalletBalance', () => {
    it('should format balance correctly', () => {
      expect(formatWalletBalance(10)).toBe('10.00 AED')
      expect(formatWalletBalance(5.5)).toBe('5.50 AED')
      expect(formatWalletBalance(0)).toBe('0.00 AED')
    })
  })

  describe('getWalletStatus', () => {
    it('should return low status for balance < 5', () => {
      const status = getWalletStatus(3)
      expect(status.status).toBe('low')
      expect(status.color).toBe('#ef4444')
      expect(status.message).toContain('Low balance')
    })

    it('should return medium status for balance 5-19', () => {
      const status = getWalletStatus(15)
      expect(status.status).toBe('medium')
      expect(status.color).toBe('#f59e0b')
      expect(status.message).toContain('Consider adding')
    })

    it('should return high status for balance >= 20', () => {
      const status = getWalletStatus(25)
      expect(status.status).toBe('high')
      expect(status.color).toBe('#10b981')
      expect(status.message).toContain('Good balance')
    })
  })

  describe('calculateUsageCount', () => {
    it('should calculate correct usage count', () => {
      expect(calculateUsageCount(10, 2)).toBe(5)
      expect(calculateUsageCount(15, 3)).toBe(5)
      expect(calculateUsageCount(5, 3)).toBe(1)
      expect(calculateUsageCount(2, 3)).toBe(0)
    })
  })

  describe('getRecommendedTopUp', () => {
    it('should recommend package when balance is insufficient', () => {
      const recommendation = getRecommendedTopUp(2, 5)
      expect(recommendation).toBeTruthy()
      expect(recommendation?.amount).toBeGreaterThanOrEqual(15) // 5 * 3
    })

    it('should recommend popular package when balance is low', () => {
      const recommendation = getRecommendedTopUp(3, 2) // Less than 2 uses
      expect(recommendation?.popular).toBe(true)
    })

    it('should return null when balance is sufficient', () => {
      const recommendation = getRecommendedTopUp(20, 2)
      expect(recommendation).toBe(null)
    })
  })

  describe('getWalletPackage', () => {
    it('should return correct package by ID', () => {
      const package10 = getWalletPackage('wallet_10')
      expect(package10?.amount).toBe(10)
      expect(package10?.label).toBe('10 AED')
    })

    it('should return null for invalid ID', () => {
      const invalidPackage = getWalletPackage('invalid_id')
      expect(invalidPackage).toBe(null)
    })
  })

  describe('calculateTotalAmount', () => {
    it('should calculate total with bonus', () => {
      const total = calculateTotalAmount('wallet_100')
      expect(total).toBe(110) // 100 + 10 bonus
    })

    it('should calculate total without bonus', () => {
      const total = calculateTotalAmount('wallet_10')
      expect(total).toBe(10) // No bonus
    })

    it('should return 0 for invalid package', () => {
      const total = calculateTotalAmount('invalid_id')
      expect(total).toBe(0)
    })
  })

  describe('validateWalletBalance', () => {
    it('should accept valid balances', () => {
      expect(validateWalletBalance(0).isValid).toBe(true)
      expect(validateWalletBalance(500).isValid).toBe(true)
      expect(validateWalletBalance(1000).isValid).toBe(true)
    })

    it('should reject negative balances', () => {
      const result = validateWalletBalance(-1)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('cannot be negative')
    })

    it('should reject balances over 1000 AED', () => {
      const result = validateWalletBalance(1001)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('cannot exceed 1000 AED')
    })
  })

  describe('TransactionDescriptions', () => {
    it('should generate correct top-up description', () => {
      const description = TransactionDescriptions.topUp(25)
      expect(description).toBe('Wallet top-up: 25.00 AED')
    })

    it('should generate correct agent usage description', () => {
      const description = TransactionDescriptions.agentUsage('Data Analyzer', 5)
      expect(description).toBe('Used Data Analyzer (5.00 AED)')
    })

    it('should generate correct refund description', () => {
      const description = TransactionDescriptions.refund(10, 'Processing error')
      expect(description).toBe('Refund: 10.00 AED - Processing error')
    })
  })

  describe('WALLET_PACKAGES constant', () => {
    it('should have all required packages', () => {
      expect(WALLET_PACKAGES).toHaveLength(4)
      
      const packageIds = WALLET_PACKAGES.map(pkg => pkg.id)
      expect(packageIds).toContain('wallet_10')
      expect(packageIds).toContain('wallet_25')
      expect(packageIds).toContain('wallet_50')
      expect(packageIds).toContain('wallet_100')
    })

    it('should have one popular package', () => {
      const popularPackages = WALLET_PACKAGES.filter(pkg => pkg.popular)
      expect(popularPackages).toHaveLength(1)
      expect(popularPackages[0].id).toBe('wallet_25')
    })

    it('should have bonus only on wallet_100', () => {
      const bonusPackages = WALLET_PACKAGES.filter(pkg => pkg.bonus)
      expect(bonusPackages).toHaveLength(1)
      expect(bonusPackages[0].id).toBe('wallet_100')
      expect(bonusPackages[0].bonus).toBe(10)
    })
  })
})