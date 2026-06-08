import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoiceNumber } from '@/lib/invoiceNumber'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const supabase = await createClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get recurring invoices due today
    const { data: recurringInvoices } = await supabase
      .from('recurring_invoices')
      .select('*, clients(*)')
      .eq('status', 'active')
      .lte('next_send_date', today.toISOString())
    
    let generated = 0
    
    for (const recurring of recurringInvoices || []) {
      const invoiceNumber = await generateInvoiceNumber(recurring.user_id)
      
      await supabase.from('invoices').insert({
        user_id: recurring.user_id,
        client_id: recurring.client_id,
        invoice_number: invoiceNumber,
        total: recurring.amount,
        status: 'draft',
        notes: recurring.description,
      })
      
      // Update next send date
      let nextDate = new Date(recurring.next_send_date)
      if (recurring.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7)
      else if (recurring.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1)
      else if (recurring.frequency === 'quarterly') nextDate.setMonth(nextDate.getMonth() + 3)
      else if (recurring.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1)
      
      await supabase
        .from('recurring_invoices')
        .update({ next_send_date: nextDate.toISOString().split('T')[0] })
        .eq('id', recurring.id)
      
      generated++
    }
    
    return NextResponse.json({ success: true, generated })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
