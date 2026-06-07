import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET
    
    // Debug logging
    console.log('Auth header exists:', !!authHeader)
    console.log('Expected secret exists:', !!expectedSecret)
    console.log('Auth header preview:', authHeader ? authHeader.substring(0, 15) + '...' : 'none')
    console.log('Expected secret preview:', expectedSecret ? expectedSecret.substring(0, 10) + '...' : 'none')
    
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: {
          hasAuth: !!authHeader,
          hasSecret: !!expectedSecret
        }
      }, { status: 401 })
    }
    
    const supabase = await createClient()
    const today = new Date()
    let remindersSent = 0
    
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, clients(*), users!inner(email)')
      .eq('status', 'sent')
      .not('paid', 'eq', true)
    
    for (const invoice of invoices || []) {
      const dueDate = new Date(invoice.due_date)
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
      const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))
      
      let reminderType = null
      let daysValue = 0
      
      if (daysUntilDue === 3) {
        reminderType = 'due_soon'
        daysValue = 3
      }
      else if ([1, 3, 7, 14, 30].includes(daysOverdue)) {
        reminderType = 'overdue'
        daysValue = daysOverdue
      }
      
      if (reminderType) {
        await resend.emails.send({
          from: 'SheetInvoicer <reminders@sheetinvoicer.com>',
          to: [invoice.clients.email],
          subject: reminderType === 'due_soon' 
            ? `Payment Reminder: Invoice ${invoice.invoice_number} is due in ${daysValue} days`
            : `Overdue Payment: Invoice ${invoice.invoice_number} is ${daysValue} days overdue`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2>${reminderType === 'due_soon' ? 'Payment Reminder' : 'Overdue Payment Notice'}</h2>
              <p>Dear ${invoice.clients.name},</p>
              <p>This is a reminder that invoice <strong>${invoice.invoice_number}</strong> for <strong>$${invoice.total}</strong> ${reminderType === 'due_soon' ? `is due in ${daysValue} days` : `is ${daysValue} days overdue`}.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Pay Now</a>
              <p>Thank you for your prompt payment.</p>
            </div>
          `,
        })
        remindersSent++
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      remindersSent,
      message: `Sent ${remindersSent} reminders`
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
