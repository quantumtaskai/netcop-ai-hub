'use client'

import { useEffect, useState } from 'react'
import { colors, gradients, spacing, transitions } from '@/lib/designSystem'
import { cardStyles, textStyles } from '@/lib/styleUtils'

interface ProcessingStatusProps {
  isProcessing: boolean
  status: string
  progress?: number
}

export default function ProcessingStatus({ isProcessing, status, progress }: ProcessingStatusProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isProcessing) return

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isProcessing])

  if (!isProcessing) return null

  return (
    <div style={{
      ...cardStyles.base,
      marginBottom: spacing.lg
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: `4px solid ${colors.gray[200]}`,
          borderTopColor: colors.primary[500],
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>
          <h3 style={{
            ...textStyles.h4,
            marginBottom: spacing.xs
          }}>
            Processing{dots}
          </h3>
          <p style={{
            ...textStyles.small
          }}>
            {status}
          </p>
        </div>
      </div>

      {progress !== undefined && (
        <div style={{
          background: colors.gray[100],
          borderRadius: spacing.md,
          height: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: gradients.primary,
            height: '100%',
            width: `${progress}%`,
            transition: transitions.slow
          }}></div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}