import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, name } = await request.json()

    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2563eb, #1e40af); border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0;">Welcome to SheetInvoicer! 🎉</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="color: #1f2937;">Hi ${name || 'there'}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">Thank you for signing up for SheetInvoicer. We're excited to help you streamline your invoicing process.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">🚀 Quick Start Guide</h3>
            <ol style="color: #4b5563; line-height: 1.8;">
              <li>Add your first client → <strong>Clients → Add Client</strong></li>
              <li>Create an invoice → <strong>Invoices → + New Invoice</strong></li>
              <li>Upload CSV for bulk invoices → <strong>CSV Upload</strong></li>
              <li>Send email to client → <strong>Send Email</strong></li>
              <li>Get paid → <strong>Stripe integration ready</strong></li>
            </ol>
          </div>
          
          <div style="display: flex; gap: 10px; margin: 20px 0;">
            <a href="https://sheetinvoicer.vercel.app/dashboard" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
            <a href="https://sheetinvoicer.vercel.app/dashboard/invoices/new" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Create First Invoice</a>
          </div>
          
          <p style="color: #4b5563; font-size: 14px;">Need help? Reply to this email or check our documentation.</p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© 2026 SheetInvoicer. All rights reserved.</p>
        </div>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'SheetInvoicer <welcome@sheetinvoicer.com>',
      to: [email],
      subject: 'Welcome to SheetInvoicer! 🎉 Get Started Guide',
      html: welcomeHtml,
    })

    if (error) {
      console.error('Welcome email error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
