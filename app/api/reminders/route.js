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
    
    // Try to get existing settings
    let { data, error } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    // If table doesn't exist, return default settings
    if (error && error.message.includes('does not exist')) {
      return NextResponse.json({ 
        success: true, 
        data: {
          enabled: true,
          days_before_due: 3,
          days_after_due: [1, 3, 7, 14],
          reminder_time: '09:00:00',
          auto_mark_overdue: true,
          overdue_days: 30
        }
      })
    }
    
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
    
    // First, ensure the table exists by trying to insert
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
