'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [envStatus, setEnvStatus] = useState<any>({})

  useEffect(() => {
    const checkEnv = () => {
      const envVars = {
        'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
        'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
        'NODE_ENV': process.env.NODE_ENV,
        'Browser': typeof window !== 'undefined' ? 'YES' : 'NO',
        'Timestamp': new Date().toISOString()
      }
      setEnvStatus(envVars)
    }

    checkEnv()
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>🚫 Debug page disabled in production</h1>
        <p>This debug page is only available in development mode.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 Environment Debug Page</h1>
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
        <h2>Environment Variables Status:</h2>
        <pre>{JSON.stringify(envStatus, null, 2)}</pre>
      </div>
      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f4f8', borderRadius: '8px' }}>
        <h3>💡 Troubleshooting Tips:</h3>
        <ul>
          <li>Make sure .env.local exists in your project root</li>
          <li>Restart your development server after changing environment variables</li>
          <li>In production, set environment variables in your hosting platform dashboard</li>
          <li>Check that variable names start with NEXT_PUBLIC_ for client-side access</li>
        </ul>
      </div>
    </div>
  )
}