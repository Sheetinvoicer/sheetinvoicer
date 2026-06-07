import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No userId' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data: data || {} })
  } catch (error) {
    console.error('GET reminder error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('reminder_settings')
      .upsert({
        user_id: body.user_id,
        enabled: body.enabled,
        days_before_due: body.days_before_due,
        days_after_due: body.days_after_due,
        reminder_time: body.reminder_time || '09:00:00',
        auto_mark_overdue: body.auto_mark_overdue !== false,
        overdue_days: body.overdue_days || 30,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Upsert error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('POST reminder error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
