import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    
    let data = []
    let headers = []
    
    if (type === 'invoices') {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*, clients(name, email)')
        .eq('user_id', userId)
      data = invoices || []
      headers = ['Invoice Number', 'Client', 'Date', 'Total', 'Status']
    } else if (type === 'clients') {
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
      data = clients || []
      headers = ['Name', 'Email', 'Phone', 'Address']
    } else if (type === 'expenses') {
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
      data = expenses || []
      headers = ['Date', 'Category', 'Description', 'Amount']
    }
    
    let csvContent = headers.join(',') + '\n'
    
    for (const row of data) {
      const values = headers.map(h => {
        if (type === 'invoices') {
          if (h === 'Invoice Number') return row.invoice_number
          if (h === 'Client') return row.clients?.name
          if (h === 'Date') return new Date(row.created_at).toLocaleDateString()
          if (h === 'Total') return row.total
          if (h === 'Status') return row.status
        } else if (type === 'clients') {
          if (h === 'Name') return row.name
          if (h === 'Email') return row.email
          if (h === 'Phone') return row.phone || ''
          if (h === 'Address') return row.address || ''
        } else if (type === 'expenses') {
          if (h === 'Date') return new Date(row.date).toLocaleDateString()
          if (h === 'Category') return row.category
          if (h === 'Description') return row.description || ''
          if (h === 'Amount') return row.amount
        }
        return ''
      }).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
      csvContent += values + '\n'
    }
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${type}_export.csv`,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
