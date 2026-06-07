import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cronSecret = process.env.CRON_SECRET
    
    // Make sure the secret is a string
    const secret = String(cronSecret || '').trim()
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/send-reminders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    return NextResponse.json({ 
      success: true, 
      cronResult: data,
      secretLength: secret.length,
      hasSecret: secret.length > 0
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
