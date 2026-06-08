import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*, clients(name, email)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(invoices || [])
  } catch (error) {
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
    
    const { data: newInvoice, error } = await supabase
      .from('invoices')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(newInvoice)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
