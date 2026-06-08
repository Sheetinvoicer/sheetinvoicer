import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(expenses || [])
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
    
    const { data: newExpense, error } = await supabase
      .from('expenses')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(newExpense)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
