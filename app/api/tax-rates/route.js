import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tax_rates')
      .select('*')
      .eq('is_active', true)
      .order('percentage', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('tax_rates')
      .insert(body)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
