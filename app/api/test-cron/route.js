import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cronSecret = process.env.CRON_SECRET
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/send-reminders`, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })
    const data = await response.json()
    return NextResponse.json({ 
      success: true, 
      cronResult: data,
      cronSecretUsed: !!cronSecret
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
