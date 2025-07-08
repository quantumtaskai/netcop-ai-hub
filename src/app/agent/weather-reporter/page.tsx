'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { getAgentInfo } from '@/lib/agentUtils'
import { getAgentPrice } from '@/lib/agentPricing'
import { supabase } from '@/lib/supabase'
import AgentLayout from '@/components/agent-shared/AgentLayout'
import ProcessingStatus from '@/components/agent-shared/ProcessingStatus'
import ResultsDisplay from '@/components/agent-shared/ResultsDisplay'
import WalletBalance from '@/components/agent-shared/WalletBalance'

interface WeatherData {
  location: string
  current: {
    temperature: number
    feels_like: number
    humidity: number
    pressure: number
    visibility: number
    wind_speed: number
    wind_direction: number
    weather_condition: string
    weather_description: string
    icon: string
  }
  forecast?: object[]
  alerts?: object[]
  generated_at: string
}

function WeatherReporterForm() {
  const router = useRouter()
  const { user, updateWallet } = useUserStore()
  
  // Get agent pricing
  const agentPrice = getAgentPrice('weather-reporter')
  const agentSlug = 'weather-reporter'
  
  // Component state
  const [location, setLocation] = useState('')
  const [reportType, setReportType] = useState('current')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [results, setResults] = useState<WeatherData | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Get agent info
  const agentInfo = getAgentInfo('weather-reporter')

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) return null

  const getWeatherReport = async () => {
    if (!location.trim()) {
      toast.error('Please enter a location')
      return
    }

    setIsProcessing(true)
    setShowResults(false)
    setProcessingStatus('Getting weather data...')

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      
      if (!apiKey) {
        throw new Error('OpenWeatherMap API key not configured')
      }

      // Step 1: Get coordinates from location name
      setProcessingStatus('Finding location...')
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
      )

      if (!geoResponse.ok) {
        throw new Error('Failed to find location')
      }

      const geoData = await geoResponse.json()
      
      if (!geoData || geoData.length === 0) {
        throw new Error('Location not found. Please try a different location.')
      }

      const { lat, lon, name, country } = geoData[0]
      const fullLocationName = `${name}, ${country}`

      // Step 2: Get weather data
      setProcessingStatus('Fetching weather data...')
      
      let weatherData: Record<string, any> = {}

      if (reportType === 'current' || reportType === 'detailed') {
        // Current weather
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        )
        
        if (!currentResponse.ok) {
          throw new Error('Failed to fetch current weather')
        }
        
        const currentData = await currentResponse.json()
        weatherData.current = currentData
      }

      if (reportType === 'forecast' || reportType === 'detailed') {
        // 5-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        )
        
        if (!forecastResponse.ok) {
          throw new Error('Failed to fetch weather forecast')
        }
        
        const forecastData = await forecastResponse.json()
        weatherData.forecast = forecastData.list
      }

      // Step 3: Format the results
      setProcessingStatus('Formatting weather report...')
      
      const formattedResults: WeatherData = {
        location: fullLocationName,
        current: {
          temperature: Math.round(weatherData.current?.main?.temp || 0),
          feels_like: Math.round(weatherData.current?.main?.feels_like || 0),
          humidity: weatherData.current?.main?.humidity || 0,
          pressure: weatherData.current?.main?.pressure || 0,
          visibility: Math.round((weatherData.current?.visibility || 0) / 1000),
          wind_speed: Math.round((weatherData.current?.wind?.speed || 0) * 3.6), // Convert m/s to km/h
          wind_direction: weatherData.current?.wind?.deg || 0,
          weather_condition: weatherData.current?.weather?.[0]?.main || 'Unknown',
          weather_description: weatherData.current?.weather?.[0]?.description || 'No description',
          icon: weatherData.current?.weather?.[0]?.icon || '01d'
        },
        forecast: weatherData.forecast || [],
        generated_at: new Date().toISOString()
      }

      // Step 4: Display results
      setResults(formattedResults)
      setShowResults(true)

      // Step 5: Deduct wallet balance and create transaction record
      console.log('🔄 Deducting wallet balance for weather report:', agentPrice!.priceDisplay)
      await updateWallet(-agentPrice!.price)
      
      // Create transaction record
      try {
        const { error: transactionError } = await supabase
          .from('wallet_transactions')
          .insert({
            user_id: user.id,
            amount: -agentPrice!.price,
            type: 'agent_usage',
            description: `Weather Report - ${fullLocationName}`,
            agent_slug: 'weather-reporter'
          })

        if (transactionError) {
          console.error('Failed to create transaction record:', transactionError)
          // Don't fail the whole process for transaction record issues
        } else {
          console.log('✅ Transaction record created for weather report')
        }
      } catch (error) {
        console.error('Transaction record creation error:', error)
        // Don't fail the whole process for transaction record issues
      }

      toast.success(`Weather report generated! ${agentPrice!.priceDisplay} used.`)

    } catch (error) {
      console.error('Weather API error:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('not configured')) {
          toast.error('Weather service not configured. Please contact support.')
        } else if (error.message.includes('not found')) {
          toast.error('Location not found. Please try a different location.')
        } else if (error.message.includes('Failed to fetch')) {
          toast.error('Unable to get weather data. Please try again.')
        } else {
          toast.error(`Weather lookup failed: ${error.message}`)
        }
      } else {
        toast.error('Failed to get weather report. Please try again.')
      }
    } finally {
      setIsProcessing(false)
      setProcessingStatus('')
    }
  }

  return (
    <AgentLayout
      title={agentInfo.title}
      description={agentInfo.description}
      icon={agentInfo.icon}
      cost={agentPrice?.price || 0}
    >
      <Toaster position="top-right" />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))',
        gap: 'clamp(16px, 4vw, 24px)',
        alignItems: 'start'
      }}>
        {/* Main Content */}
        <div>
          {/* Location Input Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(16px, 4vw, 24px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            marginBottom: 'clamp(16px, 4vw, 24px)'
          }}>
            <h3 style={{
              fontSize: 'clamp(16px, 4vw, 18px)',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 'clamp(12px, 3vw, 16px)'
            }}>
              📍 Enter Location
            </h3>
            
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city name, address, or coordinates..."
              style={{
                width: '100%',
                padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 20px)',
                border: '2px solid #e5e7eb',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                marginBottom: 'clamp(12px, 3vw, 16px)',
                transition: 'border-color 0.2s ease',
                minHeight: '48px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  getWeatherReport()
                }
              }}
              onFocus={(e) => (e.target as HTMLElement).style.borderColor = '#3b82f6'}
              onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#e5e7eb'}
            />

            <div style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: '#6b7280' }}>
              Examples: &quot;New York&quot;, &quot;London, UK&quot;, &quot;Tokyo, Japan&quot;, &quot;37.7749,-122.4194&quot;
            </div>
          </div>

          {/* Report Type Selection */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(16px, 4vw, 24px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            marginBottom: 'clamp(16px, 4vw, 24px)'
          }}>
            <h3 style={{
              fontSize: 'clamp(16px, 4vw, 18px)',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 'clamp(12px, 3vw, 16px)'
            }}>
              📊 Report Type
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
              gap: 'clamp(8px, 2vw, 12px)'
            }}>
              {[
                { id: 'current', label: 'Current Weather', desc: 'Real-time conditions', icon: '🌡️' },
                { id: 'forecast', label: '5-Day Forecast', desc: 'Extended weather outlook', icon: '📅' },
                { id: 'detailed', label: 'Detailed Report', desc: 'Current + forecast combined', icon: '📋' }
              ].map(option => (
                <label
                  key={option.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(8px, 2vw, 12px)',
                    padding: 'clamp(12px, 3vw, 16px)',
                    border: `2px solid ${reportType === option.id ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: 'clamp(8px, 2vw, 12px)',
                    cursor: 'pointer',
                    background: reportType === option.id ? '#eff6ff' : 'white',
                    transition: 'all 0.2s ease',
                    minHeight: '44px'
                  }}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={option.id}
                    checked={reportType === option.id}
                    onChange={(e) => setReportType(e.target.value)}
                    style={{ margin: 0 }}
                  />
                  <div style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>{option.icon}</div>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: 'clamp(2px, 1vw, 4px)', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: '#6b7280' }}>
                      {option.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Processing Status */}
          <ProcessingStatus
            isProcessing={isProcessing}
            status={processingStatus}
          />

          {/* Results */}
          {showResults && results && (
            <ResultsDisplay
              results={results}
              title="Weather Report"
              isVisible={showResults}
            />
          )}
        </div>

        {/* Sidebar */}
        <div>
          <WalletBalance
            agentSlug={agentSlug}
            onProcess={getWeatherReport}
            disabled={!location.trim()}
            processing={isProcessing}
          />
        </div>
      </div>
    </AgentLayout>
  )
}

export default function WeatherReporterPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#3b82f6', fontSize: '18px' }}>Loading...</div>
      </div>
    }>
      <WeatherReporterForm />
    </Suspense>
  )
}