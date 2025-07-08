/**
 * Error Boundary Components
 * Catches JavaScript errors anywhere in the component tree and displays fallback UI
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { colors, spacing } from '@/lib/designSystem'
import { sanitizeForLogging } from '@/lib/inputValidation'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', sanitizeForLogging({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    }))

    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    window.location.reload()
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: spacing.xl,
          textAlign: 'center',
          background: colors.gray[50],
          borderRadius: '12px',
          border: `1px solid ${colors.gray[200]}`
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: spacing.lg
          }}>
            ⚠️
          </div>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: colors.gray[900],
            marginBottom: spacing.md
          }}>
            Something went wrong
          </h2>
          
          <p style={{
            fontSize: '16px',
            color: colors.gray[600],
            marginBottom: spacing.lg,
            maxWidth: '500px'
          }}>
            We apologize for the inconvenience. An unexpected error occurred while loading this section.
          </p>
          
          <div style={{
            display: 'flex',
            gap: spacing.md,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                background: colors.primary[500],
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[600]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[500]
              }}
            >
              Try Again
            </button>
            
            <button
              onClick={this.handleReload}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                background: colors.gray[200],
                color: colors.gray[700],
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.gray[300]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.gray[200]
              }}
            >
              Reload Page
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              marginTop: spacing.lg,
              maxWidth: '600px',
              textAlign: 'left'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontSize: '14px',
                color: colors.gray[500],
                marginBottom: spacing.sm
              }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                background: colors.gray[100],
                padding: spacing.md,
                borderRadius: '4px',
                fontSize: '12px',
                color: colors.gray[700],
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {this.state.error.message}
                {this.state.error.stack && '\n\n' + this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

/**
 * Agent-specific error boundary with custom messaging
 */
export function AgentErrorBoundary({ 
  children, 
  agentName 
}: { 
  children: ReactNode
  agentName: string 
}) {
  return (
    <ErrorBoundary
      fallback={
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          padding: spacing.xl,
          textAlign: 'center',
          background: colors.gray[50],
          borderRadius: '12px',
          border: `1px solid ${colors.gray[200]}`
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: spacing.md
          }}>
            🤖💥
          </div>
          
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: colors.gray[900],
            marginBottom: spacing.sm
          }}>
            {agentName} Agent Error
          </h3>
          
          <p style={{
            fontSize: '16px',
            color: colors.gray[600],
            marginBottom: spacing.lg
          }}>
            The {agentName} agent encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
          </p>
          
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              background: colors.primary[500],
              color: colors.white,
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Refresh Agent
          </button>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error(`${agentName} Agent Error:`, sanitizeForLogging({
          agentName,
          error: error.message,
          componentStack: errorInfo.componentStack
        }))
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * API Error boundary for handling API-related errors
 */
export function ApiErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          padding: spacing.lg,
          textAlign: 'center',
          background: colors.danger[50],
          borderRadius: '8px',
          border: `1px solid ${colors.danger[200]}`
        }}>
          <div style={{
            fontSize: '32px',
            marginBottom: spacing.md
          }}>
            📡❌
          </div>
          
          <h4 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.danger[700],
            marginBottom: spacing.sm
          }}>
            API Connection Error
          </h4>
          
          <p style={{
            fontSize: '14px',
            color: colors.danger[600]
          }}>
            Unable to connect to the service. Please check your internet connection and try again.
          </p>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('API Error:', sanitizeForLogging({
          error: error.message,
          type: 'API_ERROR',
          componentStack: errorInfo.componentStack
        }))
      }}
    >
      {children}
    </ErrorBoundary>
  )
}