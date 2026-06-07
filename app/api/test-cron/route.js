import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cronSecret = process.env.CRON_SECRET
    
    // Get the first 10 chars for debugging (don't expose full secret)
    const secretPreview = cronSecret ? cronSecret.substring(0, 10) + '...' : 'undefined'
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/send-reminders`, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })
    const data = await response.json()
    
    return NextResponse.json({ 
      success: true, 
      cronResult: data,
      cronSecretPreview: secretPreview,
      cronSecretExists: !!cronSecret
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
