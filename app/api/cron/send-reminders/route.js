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
    
    const supabase = createClient()
    
    // Get invoices that need reminders
    const today = new Date()
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, clients(*), users!inner(email)')
      .eq('status', 'sent')
      .lt('due_date', today.toISOString())
      .not('reminder_sent', 'is', null)
    
    for (const invoice of invoices || []) {
      const daysOverdue = Math.floor((today - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24))
      
      // Check if reminder should be sent for this overdue period
      const reminderDays = [1, 3, 7, 14, 30]
      if (reminderDays.includes(daysOverdue)) {
        await resend.emails.send({
          from: 'SheetInvoicer <reminders@sheetinvoicer.com>',
          to: [invoice.clients.email],
          subject: `Payment Reminder: Invoice ${invoice.invoice_number} is ${daysOverdue} days overdue`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2>Payment Reminder</h2>
              <p>Dear ${invoice.clients.name},</p>
              <p>This is a reminder that invoice <strong>${invoice.invoice_number}</strong> for <strong>$${invoice.total}</strong> is ${daysOverdue} days overdue.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Pay Now</a>
              <p>Thank you for your prompt payment.</p>
            </div>
          `,
        })
      }
    }
    
    return NextResponse.json({ success: true, sent: invoices?.length || 0 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
