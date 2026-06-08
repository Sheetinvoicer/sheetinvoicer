import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data, error } = await supabase
      .from('user_currency_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      data: data || { default_currency: 'USD', auto_convert: false } 
    })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data, error } = await supabase
      .from('user_currency_settings')
      .upsert({
        user_id: user.id,
        default_currency: body.default_currency || 'USD',
        auto_convert: body.auto_convert || false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
