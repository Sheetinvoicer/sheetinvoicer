import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    
    if (!userId || !type) {
      return new NextResponse('Missing userId or type', { status: 400 })
    }
    
    let headers = []
    let rows = []
    
    if (type === 'invoices') {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('invoice_number, created_at, total, status, clients(name, email)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      headers = ['Invoice Number', 'Client', 'Client Email', 'Date', 'Amount', 'Status']
      rows = (invoices || []).map(inv => [
        inv.invoice_number,
        inv.clients?.name || '',
        inv.clients?.email || '',
        new Date(inv.created_at).toLocaleDateString(),
        inv.total,
        inv.status
      ])
    } 
    else if (type === 'clients') {
      const { data: clients } = await supabase
        .from('clients')
        .select('name, email, phone, address, city, state, zip, country')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Zip', 'Country']
      rows = (clients || []).map(c => [
        c.name,
        c.email,
        c.phone || '',
        c.address || '',
        c.city || '',
        c.state || '',
        c.zip || '',
        c.country || ''
      ])
    }
    else if (type === 'expenses') {
      const { data: expenses } = await supabase
        .from('expenses')
        .select('date, category, description, amount, is_deductible')
        .eq('user_id', userId)
        .order('date', { ascending: false })
      
      headers = ['Date', 'Category', 'Description', 'Amount', 'Tax Deductible']
      rows = (expenses || []).map(e => [
        new Date(e.date).toLocaleDateString(),
        e.category,
        e.description || '',
        e.amount,
        e.is_deductible ? 'Yes' : 'No'
      ])
    }
    
    // Build CSV
    let csvContent = headers.join(',') + '\n'
    for (const row of rows) {
      const escapedRow = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      csvContent += escapedRow + '\n'
    }
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${type}_export_${new Date().toISOString().split('T')[0]}.csv`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return new NextResponse(`Error: ${error.message}`, { status: 500 })
  }
}
