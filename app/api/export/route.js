import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    
    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    let data = []
    let headers = []
    
    if (type === 'clients') {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('name, email, phone, address, city, state, zip, country')
        .eq('user_id', userId)
        .order('name', { ascending: true })
      
      if (error) throw error
      
      data = clients || []
      headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Zip', 'Country']
    }
    else if (type === 'invoices') {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('invoice_number, created_at, total, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      data = invoices || []
      headers = ['Invoice Number', 'Date', 'Amount', 'Status']
    }
    else if (type === 'expenses') {
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('date, category, description, amount, is_deductible')
        .eq('user_id', userId)
        .order('date', { ascending: false })
      
      if (error) throw error
      
      data = expenses || []
      headers = ['Date', 'Category', 'Description', 'Amount', 'Tax Deductible']
    }
    
    // Build CSV
    let csvContent = headers.join(',') + '\n'
    
    for (const item of data) {
      const row = headers.map(header => {
        let value = ''
        if (type === 'clients') {
          if (header === 'Name') value = item.name
          else if (header === 'Email') value = item.email
          else if (header === 'Phone') value = item.phone || ''
          else if (header === 'Address') value = item.address || ''
          else if (header === 'City') value = item.city || ''
          else if (header === 'State') value = item.state || ''
          else if (header === 'Zip') value = item.zip || ''
          else if (header === 'Country') value = item.country || ''
        }
        else if (type === 'invoices') {
          if (header === 'Invoice Number') value = item.invoice_number
          else if (header === 'Date') value = new Date(item.created_at).toLocaleDateString()
          else if (header === 'Amount') value = item.total
          else if (header === 'Status') value = item.status
        }
        else if (type === 'expenses') {
          if (header === 'Date') value = new Date(item.date).toLocaleDateString()
          else if (header === 'Category') value = item.category
          else if (header === 'Description') value = item.description || ''
          else if (header === 'Amount') value = item.amount
          else if (header === 'Tax Deductible') value = item.is_deductible ? 'Yes' : 'No'
        }
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(',')
      csvContent += row + '\n'
    }
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${type}_export_${new Date().toISOString().split('T')[0]}.csv`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
