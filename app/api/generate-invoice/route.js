import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    console.log('API called - simplified version');
    
    // Parse request
    const { csvData, fieldMapping, businessInfo } = await request.json();

    // Validate
    if (!businessInfo?.name) {
      return NextResponse.json({ error: 'Business name required' }, { status: 400 });
    }

    if (!fieldMapping?.clientEmail) {
      return NextResponse.json({ error: 'Client Email mapping required' }, { status: 400 });
    }

    // Group by client
    const invoicesByClient = {};
    csvData.forEach(row => {
      const email = row[fieldMapping.clientEmail];
      if (email) {
        if (!invoicesByClient[email]) {
          invoicesByClient[email] = {
            clientName: row[fieldMapping.clientName] || 'Client',
            clientEmail: email,
            items: []
          };
        }
        invoicesByClient[email].items.push({
          description: row[fieldMapping.description] || 'Item',
          quantity: row[fieldMapping.quantity] || 1,
          unitPrice: row[fieldMapping.unitPrice] || 0,
          amount: row[fieldMapping.amount] || 0
        });
      }
    });

    // Send simple emails (no PDF attachments)
    let sentCount = 0;
    for (const [email, invoice] of Object.entries(invoicesByClient)) {
      try {
        const total = invoice.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        
        await resend.emails.send({
          from: 'SheetInvoicer <onboarding@resend.dev>',
          to: [email],
          subject: `Invoice from ${businessInfo.name}`,
          html: `
            <h2>Invoice from ${businessInfo.name}</h2>
            <p>Hello ${invoice.clientName},</p>
            <p>Here is your invoice summary:</p>
            <ul>
              ${invoice.items.map(item => 
                `<li>${item.description} - $${(parseFloat(item.amount) || 0).toFixed(2)}</li>`
              ).join('')}
            </ul>
            <p><strong>Total: $${total.toFixed(2)}</strong></p>
            <p>Thank you for your business!</p>
          `
        });
        
        sentCount++;
        console.log(`Email sent to ${email}`);
      } catch (emailError) {
        console.error(`Failed to send to ${email}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Emails sent to ${sentCount} clients`,
      sent: sentCount
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Request failed: ' + error.message },
      { status: 500 }
    );
  }
}
