import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    console.log('Cron job started')
    const supabase = await createClient()
    let remindersSent = 0

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, clients(*)')
      .eq('status', 'sent')
      .neq('paid', true)

    console.log(`Found ${invoices?.length || 0} invoices`)

    for (const invoice of invoices || []) {
      const dueDate = new Date(invoice.due_date)
      const today = new Date()
      const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))

      if ([1, 3, 7, 14, 30].includes(daysOverdue) && invoice.clients?.email) {
        console.log(`Sending reminder for invoice ${invoice.invoice_number}`)
        
        await resend.emails.send({
          from: 'SheetInvoicer <reminders@sheetinvoicer.com>',
          to: [invoice.clients.email],
          subject: `Payment Reminder: Invoice ${invoice.invoice_number} is ${daysOverdue} days overdue`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2>Payment Reminder</h2>
              <p>Dear ${invoice.clients.name},</p>
              <p>Invoice <strong>${invoice.invoice_number}</strong> for <strong>$${invoice.total}</strong> is ${daysOverdue} days overdue.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Pay Now</a>
            </div>
          `,
        })
        remindersSent++
      }
    }
    
    return NextResponse.json({ success: true, remindersSent })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
