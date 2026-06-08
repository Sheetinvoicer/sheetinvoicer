import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    
    if (error) throw error
    
    return NextResponse.json(clients || [])
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
    
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(newClient)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
