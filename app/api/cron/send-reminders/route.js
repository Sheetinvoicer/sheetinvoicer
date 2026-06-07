import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const supabase = await createClient()
    let remindersSent = 0

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, clients(*)')
      .eq('status', 'sent')
      .neq('paid', true)

    for (const invoice of invoices || []) {
      const dueDate = new Date(invoice.due_date)
      const today = new Date()
      const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))

      if ([1, 3, 7, 14, 30].includes(daysOverdue) && invoice.clients?.email) {
        await resend.emails.send({
          from: 'SheetInvoicer <reminders@sheetinvoicer.com>',
          to: [invoice.clients.email],
          subject: `Payment Reminder: Invoice ${invoice.invoice_number} is ${daysOverdue} days overdue`,
          html: `<div>Your invoice ${invoice.invoice_number} for $${invoice.total} is ${daysOverdue} days overdue. <a href="${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}">Pay Now</a></div>`,
        })
        remindersSent++
      }
    }
    
    return NextResponse.json({ success: true, remindersSent })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
