'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface FooterProps {
  onPrivacyModalOpen?: () => void
}

const Footer: React.FC<FooterProps> = ({ onPrivacyModalOpen }) => {
  return (
    <footer style={{
      padding: '40px 24px 24px',
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
          gap: '48px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {/* Company Info */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div>
              <img 
                src="/logo.png" 
                alt="Netcop Consultancy Logo"
                style={{
                  height: '60px',
                  width: 'auto',
                  filter: 'brightness(0) invert(1)',
                  marginBottom: '16px'
                }}
              />
              <p style={{ 
                color: '#94a3b8',
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '0 0 12px 0'
              }}>
                Leading cybersecurity consultancy providing comprehensive security solutions and AI-powered automation.
              </p>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{ color: '#e2e8f0', fontSize: '13px' }}>📧 contact@netcopconsultancy.com</span>
                <span style={{ color: '#e2e8f0', fontSize: '13px' }}>📍 Dubai, UAE</span>
              </div>
            </div>
          </div>

          {/* Services and Company - Right Aligned */}
          <div style={{
            display: 'flex',
            gap: '48px',
            alignItems: 'flex-start'
          }}>
            {/* Services */}
            <div style={{ textAlign: 'right' }}>
              <h4 style={{
                fontWeight: '600',
                color: 'white',
                marginBottom: '12px',
                fontSize: '16px'
              }}>
                Services
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <a href="#services" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none',
                  fontSize: '13px'
                }}>
                  Cybersecurity Consulting
                </a>
                <a href="#services" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none',
                  fontSize: '13px'
                }}>
                  Risk Assessment
                </a>
                <a href="#services" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none',
                  fontSize: '13px'
                }}>
                  Compliance Audits
                </a>
                <a href="#services" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none',
                  fontSize: '13px'
                }}>
                  Security Training
                </a>
              </div>
            </div>

            {/* Company */}
            <div style={{ textAlign: 'right' }}>
              <h4 style={{
                fontWeight: '600',
                color: 'white',
                marginBottom: '12px',
                fontSize: '16px'
              }}>
                Company
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <a href="#company-profile" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none',
                  fontSize: '13px'
                }}>
                  About Us
                </a>
                <a href="#founder" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none',
                  fontSize: '13px'
                }}>
                  Leadership
                </a>
                <a href="#contact" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none',
                  fontSize: '13px'
                }}>
                  Contact Us
                </a>
                <Link href="/marketplace" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none',
                  fontSize: '13px'
                }}>
                  AI Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.2)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{ 
            color: '#64748b',
            margin: 0,
            fontSize: '13px'
          }}>
            © 2025 Netcop Consultancy. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {onPrivacyModalOpen && (
              <button 
                onClick={onPrivacyModalOpen}
                style={{ 
                  color: '#94a3b8', 
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Privacy Policy
              </button>
            )}
            <a href="#" style={{ 
              color: '#94a3b8', 
              textDecoration: 'none',
              fontSize: '13px'
            }}>
              Terms of Service
            </a>
            <a href="#" style={{ 
              color: '#94a3b8', 
              textDecoration: 'none',
              fontSize: '13px'
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