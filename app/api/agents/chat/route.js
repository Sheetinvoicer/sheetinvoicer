import { createClient } from '@/lib/supabase/server';
import { ClientAgent } from '@/lib/agents/client-agent';
import { InvoiceAgent } from '@/lib/agents/invoice-agent';
import callAI from '@/lib/ai/config';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { message, context = 'general' } = await request.json();
    
    const clientAgent = new ClientAgent(user.id);
    const invoiceAgent = new InvoiceAgent(user.id);
    
    await clientAgent.getContext();
    await invoiceAgent.getContext();
    
    const lower = message.toLowerCase();
    let response = '';
    
    if (lower.includes('analyze client') || lower.includes('client analysis')) {
      const clientMatch = message.match(/client\s+([A-Za-z0-9\s]+)/i);
      if (clientMatch) {
        const clients = clientAgent.context.clients;
        const client = clients.find(c => c.name.toLowerCase().includes(clientMatch[1].toLowerCase()));
        if (client) {
          const analysis = await clientAgent.analyzeClient(client.id);
          response = `📊 Client Analysis: ${client.name}\n\n` +
            `💰 Total Paid: $${analysis.metrics.totalPaid.toLocaleString()}\n` +
            `⏳ Total Pending: $${analysis.metrics.totalPending.toLocaleString()}\n` +
            `📄 Total Invoices: ${analysis.metrics.invoiceCount}\n` +
            `⏱️ Avg Payment Time: ${analysis.metrics.avgPaymentDays.toFixed(1)} days\n\n` +
            `⚠️ Risk Level: ${analysis.insights.riskLevel.toUpperCase()}\n` +
            `📈 Payment Reliability: ${analysis.insights.paymentReliability}\n\n` +
            `💡 Recommendation: ${analysis.insights.recommendedAction}\n\n` +
            `✨ Insights:\n${analysis.insights.insights.map(i => `• ${i}`).join('\n')}`;
        } else {
          response = `❌ Client "${clientMatch[1]}" not found.`;
        }
      } else {
        const clients = clientAgent.context.clients;
        response = `👥 Your Clients (${clients.length})\n\n` +
          clients.slice(0, 10).map(c => `• ${c.name} - ${c.email || 'No email'}`).join('\n') +
          `\n\nTo analyze a specific client, type "analyze client [name]"`;
      }
    } else if (lower.includes('predict payment') || lower.includes('when will')) {
      const invoiceMatch = message.match(/invoice\s+([A-Za-z0-9-]+)/i);
      if (invoiceMatch) {
        const invoice = invoiceAgent.context.invoices.find(i => i.invoice_number === invoiceMatch[1]);
        if (invoice) {
          const prediction = await invoiceAgent.predictLatePayment(invoice.id);
          response = `🔮 Payment Prediction for Invoice ${invoice.invoice_number}\n\n` +
            `📊 Late Probability: ${prediction.lateProbability}%\n` +
            `📅 Expected Payment Day: Day ${prediction.expectedPaymentDay}\n` +
            `⚠️ Risk Level: ${prediction.riskLevel.toUpperCase()}\n\n` +
            `💡 Recommended Action: ${prediction.recommendedAction}`;
        } else {
          response = `❌ Invoice "${invoiceMatch[1]}" not found.`;
        }
      } else {
        response = `Please specify an invoice number. Example: "predict payment for INV-000001"`;
      }
    } else if (lower.includes('segment') || lower.includes('group clients')) {
      const segmentation = await clientAgent.autoSegmentClients();
      response = `📊 Client Segmentation Analysis\n\n` +
        segmentation.segments.map(seg => 
          `${seg.name} (${seg.clients.length} clients)\n` +
          `• Characteristics: ${seg.characteristics.join(', ')}\n` +
          `• Strategy: ${seg.strategy}\n`
        ).join('\n');
    } else if (lower.includes('invoice performance') || lower.includes('invoice analytics')) {
      const performance = await invoiceAgent.analyzeInvoicePerformance();
      response = `📈 Invoice Performance Analysis\n\n` +
        `📊 Collection Rate: ${(performance.metrics.collectionRate * 100).toFixed(1)}%\n` +
        `💰 Average Value: $${performance.metrics.averageValue.toFixed(2)}\n` +
        `⚡ Payment Velocity: ${performance.metrics.paymentVelocity.toFixed(1)} days\n` +
        `🎯 Optimization Score: ${performance.optimizationScore}/100\n\n` +
        `💡 Insights:\n${performance.insights.map(i => `• ${i}`).join('\n')}\n\n` +
        `🚀 Immediate Recommendations:\n${performance.recommendations.immediate.map(r => `• ${r}`).join('\n')}`;
    } else if (lower.includes('optimize reminders') || lower.includes('reminder strategy')) {
      const optimization = await invoiceAgent.optimizePaymentReminders();
      response = `⏰ Payment Reminder Optimization\n\n` +
        `📅 Reminder Schedule:\n` +
        `• Day 1: ${optimization.reminderSchedule.day1}\n` +
        `• Day 3: ${optimization.reminderSchedule.day3}\n` +
        `• Day 7: ${optimization.reminderSchedule.day7}\n` +
        `• Day 14: ${optimization.reminderSchedule.day14}\n\n` +
        `📧 Expected Recovery Rate: ${(optimization.expectedRecoveryRate * 100).toFixed(1)}%\n\n` +
        `💡 Recommended Templates:\n${Object.entries(optimization.recommendedTemplates).map(([key, value]) => `• ${key}: ${value}`).join('\n')}`;
    } else if (lower.includes('generate invoice') || lower.includes('create template')) {
      const clientMatch = message.match(/for\s+([A-Za-z\s]+)/i);
      const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
      
      if (clientMatch && amountMatch) {
        const clients = clientAgent.context.clients;
        const client = clients.find(c => c.name.toLowerCase().includes(clientMatch[1].toLowerCase()));
        if (client) {
          const template = await invoiceAgent.autoGenerateInvoiceTemplate(client.id, parseFloat(amountMatch[1]));
          response = `📄 AI-Generated Invoice Template\n\n` +
            `Line Items:\n${template.lineItems.map(item => 
              `• ${item.description}: ${item.quantity} x $${item.unitPrice} = $${item.total}`
            ).join('\n')}\n\n` +
            `📝 Notes: ${template.notes}\n` +
            `📋 Terms: ${template.terms}\n` +
            `⏰ Due in: ${template.dueDays} days`;
        } else {
          response = `❌ Client "${clientMatch[1]}" not found.`;
        }
      } else {
        response = `Please specify client and amount. Example: "generate invoice for Beta LLC for $500"`;
      }
    } else if (lower.includes('churn risk') || lower.includes('client churn')) {
      const clientMatch = message.match(/for\s+([A-Za-z\s]+)/i);
      if (clientMatch) {
        const clients = clientAgent.context.clients;
        const client = clients.find(c => c.name.toLowerCase().includes(clientMatch[1].toLowerCase()));
        if (client) {
          const prediction = await clientAgent.predictClientChurn(client.id);
          response = `⚠️ Churn Risk Analysis: ${client.name}\n\n` +
            `📊 Churn Risk: ${prediction.churnRisk.toUpperCase()}\n` +
            `🎯 Probability: ${(prediction.probability * 100).toFixed(1)}%\n` +
            `💡 Reason: ${prediction.reason}\n\n` +
            `🚀 Retention Strategy: ${prediction.retentionStrategy}`;
        } else {
          response = `❌ Client "${clientMatch[1]}" not found.`;
        }
      } else {
        response = `Please specify a client. Example: "churn risk for Beta LLC"`;
      }
    } else {
      response = `🤖 AI Command Center\n\n` +
        `📊 Client Management\n` +
        `• "Analyze client [name]" - Deep client insights\n` +
        `• "Segment clients" - Strategic grouping\n` +
        `• "Churn risk for [name]" - Retention prediction\n\n` +
        `📄 Invoice Intelligence\n` +
        `• "Invoice performance" - Analytics\n` +
        `• "Predict payment for INV-001" - Payment timing\n` +
        `• "Optimize reminders" - Collection strategy\n` +
        `• "Generate invoice for [client] for $500" - AI template\n\n` +
        `💡 Try any command to unlock AI-powered insights!`;
    }
    
    await clientAgent.learn('user_query', { message, response }, { success: true });
    
    return Response.json({ success: true, message: response });
    
  } catch (error) {
    console.error('AI Agent Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
