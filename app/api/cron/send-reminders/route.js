import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request) {
  // Verify cron secret (for security)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const today = new Date()
  const remindersSent = []

  try {
    // Get overdue invoices (due_date < today AND status not paid)
    const { data: overdueInvoices } = await supabase
      .from('invoices')
      .select('*, clients(*)')
      .lt('due_date', today.toISOString().split('T')[0])
      .neq('status', 'paid')
      .neq('status', 'overdue')

    for (const invoice of overdueInvoices || []) {
      // Check if reminder already sent for this invoice
      const { data: existingReminder } = await supabase
        .from('reminder_logs')
        .select('id')
        .eq('invoice_id', invoice.id)
        .eq('reminder_type', 'overdue')
        .single()

      if (!existingReminder) {
        // Send reminder email
        const reminderHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Payment Reminder</h2>
            <p>Dear ${invoice.clients?.name},</p>
            <p>This is a reminder that invoice <strong>${invoice.invoice_number}</strong> is now overdue.</p>
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Amount Due:</strong> $${invoice.total?.toLocaleString()}</p>
              <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> Overdue</p>
            </div>
            <a href="https://sheetinvoicer.vercel.app/pay/${invoice.id}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Pay Now</a>
            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">Please arrange payment at your earliest convenience.</p>
          </div>
        `

        const { error } = await resend.emails.send({
          from: 'SheetInvoicer <reminders@sheetinvoicer.com>',
          to: [invoice.clients?.email],
          subject: `Payment Reminder: Invoice ${invoice.invoice_number} is Overdue`,
          html: reminderHtml,
        })

        if (!error) {
          // Log reminder
          await supabase.from('reminder_logs').insert({
            invoice_id: invoice.id,
            reminder_type: 'overdue',
          })
          
          // Update invoice status to overdue
          await supabase
            .from('invoices')
            .update({ status: 'overdue' })
            .eq('id', invoice.id)
          
          remindersSent.push(invoice.invoice_number)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      remindersSent,
      count: remindersSent.length 
    })
  } catch (error) {
    console.error('Reminder error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
