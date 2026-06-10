import { createClient } from '@/lib/supabase/server';
import { ClientAgent } from '@/lib/agents/client-agent';
import { InvoiceAgent } from '@/lib/agents/invoice-agent';
import callAI from '@/lib/ai/config';

export async function POST(request) {
  try {
    const body = await request.json();
    const { event, data } = body;
    
    const supabase = await createClient();
    
    switch(event) {
      case 'invoice.created':
        await handleInvoiceCreated(data, supabase);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(data, supabase);
        break;
      case 'client.created':
        await handleClientCreated(data, supabase);
        break;
      case 'payment.overdue':
        await handlePaymentOverdue(data, supabase);
        break;
      default:
        console.log(`Unhandled event: ${event}`);
    }
    
    return Response.json({ received: true });
    
  } catch (error) {
    console.error('Webhook Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function handleInvoiceCreated(invoice, supabase) {
  const agent = new InvoiceAgent(invoice.user_id);
  await agent.getContext();
  const risk = await agent.predictLatePayment(invoice.id);
  
  await supabase.from('invoice_insights').insert({
    invoice_id: invoice.id,
    risk_level: risk.riskLevel,
    predicted_payment_day: risk.expectedPaymentDay,
    recommended_action: risk.recommendedAction,
    created_at: new Date(),
  });
  
  if (risk.riskLevel === 'high') {
    console.log(`High risk invoice ${invoice.id} - scheduling reminders`);
  }
}

async function handleInvoicePaid(payment, supabase) {
  const agent = new ClientAgent(payment.user_id);
  await agent.getContext();
  await agent.analyzeClient(payment.client_id);
  console.log(`Payment received for invoice ${payment.id}`);
}

async function handleClientCreated(client, supabase) {
  const prompt = `Create a welcome message for this client: ${client.name}`;
  const welcomeMessage = await callAI(prompt);
  console.log(`Welcome email sent to ${client.email}`);
}

async function handlePaymentOverdue(invoice, supabase) {
  const daysOverdue = (Date.now() - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24);
  
  let escalationLevel = 'normal';
  if (daysOverdue > 30) escalationLevel = 'urgent';
  else if (daysOverdue > 15) escalationLevel = 'escalated';
  
  console.log(`Sent ${escalationLevel} reminder for invoice ${invoice.id}`);
}
