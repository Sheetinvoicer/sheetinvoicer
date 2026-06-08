import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Try to get existing settings
    let { data, error } = await supabase
      .from('user_currency_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    // If no settings exist, create default ones
    if (!data && !error) {
      const { data: newData, error: insertError } = await supabase
        .from('user_currency_settings')
        .insert({
          user_id: user.id,
          default_currency: 'USD',
          auto_convert: false
        })
        .select()
        .single()
      
      if (!insertError) {
        data = newData
      }
    }
    
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
    
    // First, check if record exists
    const { data: existing } = await supabase
      .from('user_currency_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    let result
    
    if (existing) {
      // Update existing
      result = await supabase
        .from('user_currency_settings')
        .update({
          default_currency: body.default_currency || 'USD',
          auto_convert: body.auto_convert || false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Insert new
      result = await supabase
        .from('user_currency_settings')
        .insert({
          user_id: user.id,
          default_currency: body.default_currency || 'USD',
          auto_convert: body.auto_convert || false
        })
        .select()
        .single()
    }
    
    if (result.error) {
      console.error('Save error:', result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
