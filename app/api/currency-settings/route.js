import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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
  
  return NextResponse.json({ 
    success: true, 
    data: data || { default_currency: 'USD', auto_convert: false } 
  })
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    const { default_currency, auto_convert } = await request.json()
    
    // Upsert the record
    const { error } = await supabase
      .from('user_currency_settings')
      .upsert({
        user_id: user.id,
        default_currency: default_currency || 'USD',
        auto_convert: auto_convert === true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
    
    if (error) {
      console.error('Upsert error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
