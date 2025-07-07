'use client'

import React from 'react'
import Link from 'next/link'
import { colors, spacing, typography } from '@/lib/designSystem'
import { textStyles, stylePatterns } from '@/lib/styleUtils'

interface FooterProps {
  onPrivacyModalOpen?: () => void
}

const Footer: React.FC<FooterProps> = ({ onPrivacyModalOpen }) => {
  return (
    <footer style={{
      padding: `${spacing['4xl']} ${spacing.lg} ${spacing.lg}`,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      margin: 0,
      width: '100%',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: spacing['3xl'],
          marginBottom: spacing.lg,
          flexWrap: 'wrap'
        }}>
          {/* Company Info */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div>
              <img 
                src="/logo.png" 
                alt="Netcop Consultancy Logo"
                style={{
                  height: '80px',
                  width: 'auto',
                  filter: 'brightness(0) invert(1)',
                  marginBottom: spacing.md
                }}
              />
              <p style={{ 
                color: colors.gray[400],
                fontSize: typography.fontSize.sm,
                lineHeight: typography.lineHeight.relaxed,
                margin: `0 0 ${spacing.sm} 0`
              }}>
                Leading cybersecurity consultancy providing comprehensive security solutions and AI-powered automation.
              </p>
              
              <div style={{
                ...stylePatterns.flexColumn,
                gap: spacing.xs
              }}>
                <span style={{ 
                  color: colors.gray[200], 
                  fontSize: typography.fontSize.xs 
                }}>📧 contact@netcopconsultancy.com</span>
                <span style={{ 
                  color: colors.gray[200], 
                  fontSize: typography.fontSize.xs 
                }}>📍 Dubai, UAE</span>
              </div>
            </div>
          </div>

          {/* Services and Company - Right Aligned */}
          <div style={{
            display: 'flex',
            gap: spacing['3xl'],
            alignItems: 'flex-start'
          }}>
            {/* Services */}
            <div style={{ textAlign: 'right' }}>
              <h4 style={{
                ...textStyles.h4,
                color: colors.white,
                marginBottom: spacing.sm,
                fontSize: typography.fontSize.lg
              }}>
                Services
              </h4>
              <div style={{ 
                ...stylePatterns.flexColumn, 
                gap: spacing.xs 
              }}>
                <a href="#services" style={{ 
                  color: colors.gray[400], 
                  textDecoration: 'none',
                  fontSize: typography.fontSize.xs
                }}>
                  Cybersecurity Consulting
                </a>
                <a href="#services" style={{ 
                  color: colors.gray[400], 
                  textDecoration: 'none',
                  fontSize: typography.fontSize.xs
                }}>
                  Risk Assessment
                </a>
                <a href="#services" style={{ 
                  color: colors.gray[400], 
                  textDecoration: 'none',
                  fontSize: typography.fontSize.xs
                }}>
                  Compliance Audits
                </a>
                <a href="#services" style={{ 
                  color: colors.gray[400], 
                  textDecoration: 'none',
                  fontSize: typography.fontSize.xs
                }}>
                  Security Training
                </a>
              </div>
            </div>

            {/* Company */}
            <div style={{ textAlign: 'right' }}>
              <h4 style={{
                ...textStyles.h4,
                color: colors.white,
                marginBottom: spacing.sm,
                fontSize: typography.fontSize.lg
              }}>
                Company
              </h4>
              <div style={{ 
                ...stylePatterns.flexColumn, 
                gap: spacing.xs 
              }}>
                <a href="#company-profile" style={{ 
                  color: colors.gray[400], 
                  textDecoration: 'none',
                  fontSize: typography.fontSize.xs
                }}>
                  About Us
                </a>
                <a href="#founder" style={{ 
                  color: colors.gray[400], 
                  textDecoration: 'none',
                  fontSize: typography.fontSize.xs
                }}>
                  Leadership
                </a>
                <a href="#contact" style={{ 
                  color: colors.gray[400], 
                  textDecoration: 'none',
                  fontSize: typography.fontSize.xs
                }}>
                  Contact Us
                </a>
                <Link href="/marketplace" style={{ 
                  color: colors.gray[400], 
                  textDecoration: 'none',
                  fontSize: typography.fontSize.xs
                }}>
                  AI Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          ...stylePatterns.flexBetween,
          borderTop: `1px solid rgba(148, 163, 184, 0.2)`,
          paddingTop: spacing.lg,
          flexWrap: 'wrap',
          gap: spacing.md
        }}>
          <p style={{ 
            color: colors.gray[500],
            margin: 0,
            fontSize: typography.fontSize.xs
          }}>
            © 2025 Netcop Consultancy. All rights reserved.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: spacing.lg, 
            alignItems: 'center' 
          }}>
            {onPrivacyModalOpen && (
              <button 
                onClick={onPrivacyModalOpen}
                style={{ 
                  color: colors.gray[400], 
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.xs
                }}
              >
                Privacy Policy
              </button>
            )}
            <a href="#" style={{ 
              color: colors.gray[400], 
              textDecoration: 'none',
              fontSize: typography.fontSize.xs
            }}>
              Terms of Service
            </a>
            <a href="#" style={{ 
              color: colors.gray[400], 
              textDecoration: 'none',
              fontSize: typography.fontSize.xs
            }}>
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer