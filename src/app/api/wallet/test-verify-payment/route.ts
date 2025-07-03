import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, packageId } = await request.json()
    
    // Test with a mock session ID that might be similar to what Stripe generated
    const testSessionId = sessionId || 'cs_test_51234567890'
    const testPackageId = packageId || 'wallet_10'
    
    console.log('Testing payment verification with:', {
      sessionId: testSessionId,
      packageId: testPackageId
    })
    
    // Call the actual verify-payment endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/wallet/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: testSessionId,
        packageId: testPackageId
      })
    })
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      testRequest: {
        sessionId: testSessionId,
        packageId: testPackageId
      },
      verifyPaymentResponse: {
        status: response.status,
        data: data
      }
    })
    
  } catch (error: any) {
    console.error('Test verify payment error:', error)
    return NextResponse.json(
      { error: 'Test failed', message: error.message },
      { status: 500 }
    )
  }
}