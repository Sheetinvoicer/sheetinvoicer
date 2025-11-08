import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      } catch (error) {
        console.error(`Failed to send invoice to ${clientEmail}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Invoices processed for ${Object.keys(invoicesByClient).length} clients` 
    });

  } catch (error) {
    console.error('Error generating invoices:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoices' },
      { status: 500 }
    );
  }
}

async function generatePDF(invoiceData, businessInfo) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Set up coordinates
  let yPosition = height - 100;

  // Add business info
  page.drawText(businessInfo.name, {
    x: 50,
    y: yPosition,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  if (businessInfo.address) {
    page.drawText(businessInfo.address, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
  }

  if (businessInfo.taxId) {
    page.drawText(`Tax ID: ${businessInfo.taxId}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
  }

  // Add client info
  yPosition -= 40;
  page.drawText(`Invoice for: ${invoiceData.clientName}`, {
    x: 50,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;
  page.drawText(`Email: ${invoiceData.clientEmail}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Add invoice items table
  yPosition -= 60;
  const tableTop = yPosition;

  // Table headers
  page.drawText('Description', {
    x: 50,
    y: tableTop,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('Qty', {
    x: 300,
    y: tableTop,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('Price', {
    x: 350,
    y: tableTop,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('Amount', {
    x: 450,
    y: tableTop,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Table rows
  let currentY = tableTop - 25;
  let totalAmount = 0;

  invoiceData.items.forEach(item => {
    const amount = parseFloat(item.amount) || (parseFloat(item.quantity) * parseFloat(item.unitPrice));
    totalAmount += amount;

    page.drawText(item.description.substring(0, 40), {
      x: 50,
      y: currentY,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    page.drawText(item.quantity.toString(), {
      x: 300,
      y: currentY,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    page.drawText('$' + parseFloat(item.unitPrice).toFixed(2), {
      x: 350,
      y: currentY,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    page.drawText('$' + amount.toFixed(2), {
      x: 450,
      y: currentY,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    currentY -= 20;
  });

  // Total
  currentY -= 20;
  page.drawText('Total:', {
    x: 350,
    y: currentY,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('$' + totalAmount.toFixed(2), {
    x: 450,
    y: currentY,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Save the PDF
  return await pdfDoc.save();
}

function generateEmailTemplate(invoiceData, businessInfo) {
  const totalAmount = invoiceData.items.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || (parseFloat(item.quantity) * parseFloat(item.unitPrice));
    return sum + amount;
  }, 0);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice from ${businessInfo.name}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">INVOICE</h1>
            <p style="margin: 5px 0;">from ${businessInfo.name}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Client:</strong> ${invoiceData.clientName}</p>
            <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #2563eb; color: white;">
                <th style="padding: 12px; text-align: left;">Description</th>
                <th style="padding: 12px; text-align: center;">Qty</th>
                <th style="padding: 12px; text-align: right;">Price</th>
                <th style="padding: 12px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map(item => {
                const amount = parseFloat(item.amount) || (parseFloat(item.quantity) * parseFloat(item.unitPrice));
                return `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px;">${item.description}</td>
                    <td style="padding: 12px; text-align: center;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right;">$${parseFloat(item.unitPrice).toFixed(2)}</td>
                    <td style="padding: 12px; text-align: right;">$${amount.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #f1f5f9;">
                <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
            <p style="margin: 0;">Thank you for your business!</p>
            <p style="margin: 5px 0 0 0;">
              <strong>${businessInfo.name}</strong><br>
              ${businessInfo.address || ''}
              ${businessInfo.taxId ? '<br>Tax ID: ' + businessInfo.taxId : ''}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
                                                                     }
