export async function POST(request) {
  try {
    const { csvData, fieldMapping, businessInfo } = await request.json();

    // Validate required fields
    if (!businessInfo.name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    // Check if we have valid field mappings
    if (!fieldMapping.clientEmail) {
      return NextResponse.json(
        { error: 'Client Email field mapping is required' },
        { status: 400 }
      );
    }

    // Group rows by client email for sending
    const invoicesByClient = {};
    
    csvData.forEach(row => {
      const clientEmail = row[fieldMapping.clientEmail];
      if (!clientEmail) return;

      if (!invoicesByClient[clientEmail]) {
        invoicesByClient[clientEmail] = {
          clientName: row[fieldMapping.clientName] || 'Valued Client',
          clientEmail: clientEmail,
          items: []
        };
      }

      invoicesByClient[clientEmail].items.push({
        description: row[fieldMapping.description] || 'Item',
        quantity: row[fieldMapping.quantity] || 1,
        unitPrice: row[fieldMapping.unitPrice] || row[fieldMapping.amount] || 0,
        amount: row[fieldMapping.amount] || 0
      });
    });

    // Check if we have any clients to send to
    if (Object.keys(invoicesByClient).length === 0) {
      return NextResponse.json(
        { error: 'No valid client emails found in your data' },
        { status: 400 }
      );
    }

    let sentCount = 0;
    let errorCount = 0;

    // Generate PDF and send email for each client
    for (const [clientEmail, invoiceData] of Object.entries(invoicesByClient)) {
      try {
        // Generate PDF
        const pdfBytes = await generatePDF(invoiceData, businessInfo);
        
        // Send email with PDF attachment
        await resend.emails.send({
          from: 'SheetInvoicer <onboarding@resend.dev>',
          to: [clientEmail],
          subject: `Invoice from ${businessInfo.name}`,
          html: generateEmailTemplate(invoiceData, businessInfo),
          attachments: [
            {
              filename: `invoice-${Date.now()}.pdf`,
              content: Buffer.from(pdfBytes).toString('base64')
            }
          ]
        });

        console.log(`Invoice sent to ${clientEmail}`);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send invoice to ${clientEmail}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Invoices sent to ${sentCount} clients, ${errorCount} failed`,
      sent: sentCount,
      failed: errorCount
    });

  } catch (error) {
    console.error('Error generating invoices:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoices: ' + error.message },
      { status: 500 }
    );
  }
}
