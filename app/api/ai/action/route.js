import { createClient } from '@/lib/supabase/server';
import { aiAutomation } from '@/lib/ai/automation';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { message } = await request.json();
    const lower = message.toLowerCase();
    
    // Get real data for reports
    const [invoicesRes, clientsRes, expensesRes] = await Promise.all([
      supabase.from('invoices').select('*').eq('user_id', user.id),
      supabase.from('clients').select('*').eq('user_id', user.id),
      supabase.from('expenses').select('*').eq('user_id', user.id)
    ]);
    
    const invoices = invoicesRes.data || [];
    const clients = clientsRes.data || [];
    const expenses = expensesRes.data || [];
    
    const paidRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const pendingRevenue = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    
    let response = '';
    
    // CASH FLOW PREDICTION
    if (lower.includes('cash flow') || lower.includes('predict')) {
      const prediction = await aiAutomation.predictCashFlow(user.id);
      response = `📈 **CASH FLOW PREDICTION**\n\n` +
                 `💰 Predicted Revenue: $${prediction.predictedRevenue.toFixed(2)}\n` +
                 `📉 Predicted Expenses: $${prediction.predictedExpenses.toFixed(2)}\n` +
                 `💵 Predicted Cash Flow: $${prediction.predictedCashFlow.toFixed(2)}\n` +
                 `🎯 Expected Collection: $${prediction.expectedCollection.toFixed(2)}\n` +
                 `⚠️ Risk Level: ${prediction.risk}\n\n` +
                 `💡 Recommendation: ${prediction.recommendation}`;
    }
    
    // SEND REMINDERS
    else if (lower.includes('send reminder') || lower.includes('follow up')) {
      const reminders = await aiAutomation.autoSendPaymentReminders();
      response = `📧 **REMINDERS SENT**\n\nSent ${reminders.length} reminder(s) for overdue invoices.\n\n${reminders.map(r => `• ${r.invoice} to ${r.client}`).join('\n')}`;
    }
    
    // RUN RECURRING
    else if (lower.includes('run recurring') || lower.includes('process recurring')) {
      const created = await aiAutomation.autoCreateRecurringInvoices();
      response = `🔄 **RECURRING INVOICES**\n\nCreated ${created.length} recurring invoice(s) automatically.\n\n${created.map(i => `• ${i.invoice_number} created`).join('\n')}`;
    }
    
    // CLIENT INSIGHTS
    else if (lower.includes('client insight') || lower.includes('analyze client')) {
      const clientMatch = message.match(/client\s+([A-Za-z\s]+)/i);
      if (clientMatch) {
        const client = clients.find(c => c.name.toLowerCase().includes(clientMatch[1].toLowerCase()));
        if (client) {
          const insights = await aiAutomation.getClientInsights(client.id);
          response = `👥 **CLIENT INSIGHTS: ${client.name}**\n\n` +
                     `📄 Total Invoices: ${insights.totalInvoices}\n` +
                     `💰 Total Paid: $${insights.totalPaid.toLocaleString()}\n` +
                     `⏳ Total Pending: $${insights.totalPending.toLocaleString()}\n` +
                     `⏱️ Avg Payment Time: ${insights.averagePaymentDays} days\n` +
                     `⚠️ Risk Level: ${insights.riskLevel}\n\n` +
                     `💡 Recommendation: ${insights.recommendation}`;
        } else {
          response = `❌ Client "${clientMatch[1]}" not found.`;
        }
      } else {
        response = `👥 **YOUR CLIENTS**\n\n${clients.slice(0, 10).map(c => `• ${c.name}`).join('\n')}\n\nTo analyze a specific client, type "analyze client [name]"`;
      }
    }
    
    // REPORT
    else if (lower.includes('report') || lower.includes('how am i')) {
      response = `📊 **YOUR BUSINESS REPORT**\n\n` +
                 `💰 Revenue: $${paidRevenue.toLocaleString()}\n` +
                 `⏳ Pending: $${pendingRevenue.toLocaleString()}\n` +
                 `📉 Expenses: $${totalExpenses.toLocaleString()}\n` +
                 `📈 Profit: $${(paidRevenue - totalExpenses).toLocaleString()}\n` +
                 `📄 Invoices: ${invoices.length}\n` +
                 `👥 Clients: ${clients.length}\n\n` +
                 `${(paidRevenue - totalExpenses) > 0 ? '✅ Your business is profitable!' : '⚠️ Review your expenses.'}`;
    }
    
    // HELP
    else {
      response = `🤖 **AI AUTOMATION COMMANDS**\n\n` +
                 `📊 "Show me my report" - Business summary\n` +
                 `📈 "Predict cash flow" - Future financial outlook\n` +
                 `📧 "Send reminders" - Auto-send payment reminders\n` +
                 `🔄 "Run recurring" - Process recurring invoices\n` +
                 `👥 "Analyze client [name]" - Client payment insights\n` +
                 `💡 "Client insights" - See all clients\n\n` +
                 `What would you like to automate today?`;
    }
    
    return Response.json({ success: true, message: response });
    
  } catch (error) {
    console.error('AI Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
