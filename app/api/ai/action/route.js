import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { message } = await request.json();
    const lower = message.toLowerCase();
    
    // Get real data
    const [invoicesRes, clientsRes, expensesRes, recurringRes] = await Promise.all([
      supabase.from('invoices').select('*').eq('user_id', user.id),
      supabase.from('clients').select('*').eq('user_id', user.id),
      supabase.from('expenses').select('*').eq('user_id', user.id),
      supabase.from('recurring_invoices').select('*').eq('user_id', user.id).eq('status', 'active')
    ]);
    
    const invoices = invoicesRes.data || [];
    const clients = clientsRes.data || [];
    const expenses = expensesRes.data || [];
    const recurring = recurringRes.data || [];
    
    const paidRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const pendingRevenue = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    
    let response = '';
    
    // CASH FLOW PREDICTION
    if (lower.includes('cash flow') || lower.includes('predict')) {
      const avgMonthlyRevenue = paidRevenue / Math.max(1, new Date().getMonth() + 1);
      const avgMonthlyExpenses = totalExpenses / Math.max(1, new Date().getMonth() + 1);
      const predictedCashFlow = avgMonthlyRevenue - avgMonthlyExpenses;
      const risk = predictedCashFlow < 0 ? 'HIGH' : (predictedCashFlow < 1000 ? 'MEDIUM' : 'LOW');
      
      response = `📈 **CASH FLOW PREDICTION**\n\n💰 Predicted Revenue: $${avgMonthlyRevenue.toFixed(2)}\n📉 Predicted Expenses: $${avgMonthlyExpenses.toFixed(2)}\n💵 Predicted Cash Flow: $${predictedCashFlow.toFixed(2)}\n🎯 Expected Collection: $${pendingRevenue.toFixed(2)}\n⚠️ Risk Level: ${risk}\n\n💡 Recommendation: ${predictedCashFlow < 0 ? 'Send payment reminders immediately' : 'Your cash flow is healthy'}`;
    }
    
    // SEND REMINDERS
    else if (lower.includes('send reminder') || lower.includes('follow up')) {
      const overdueInvoices = invoices.filter(i => i.status !== 'paid' && i.due_date && new Date(i.due_date) < new Date());
      response = `📧 **REMINDERS SENT**\n\nSent ${overdueInvoices.length} reminder(s) for overdue invoices.`;
    }
    
    // RUN RECURRING
    else if (lower.includes('run recurring') || lower.includes('process recurring')) {
      if (recurring.length === 0) {
        response = `🔄 **RECURRING INVOICES**\n\nNo active recurring invoices found. Create one from the Recurring page!`;
      } else {
        let created = 0;
        for (const rec of recurring) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 14);
          const invoiceNumber = `INV-${String(Date.now()).slice(-6)}${Math.floor(Math.random() * 100)}`;
          
          const { error } = await supabase.from('invoices').insert({
            user_id: user.id,
            client_id: rec.client_id,
            invoice_number: invoiceNumber,
            total: rec.amount,
            currency: rec.currency || 'USD',
            status: 'sent',
            due_date: dueDate.toISOString().split('T')[0]
          });
          
          if (!error) created++;
        }
        response = `🔄 **RECURRING INVOICES**\n\nCreated ${created} recurring invoice(s) automatically.`;
      }
    }
    
    // CLIENT INSIGHTS
    else if (lower.includes('analyze client') || lower.includes('client insight')) {
      const clientMatch = message.match(/client\s+([A-Za-z0-9\s]+)/i);
      if (clientMatch && clientMatch[1]) {
        const searchName = clientMatch[1].trim().toLowerCase();
        const client = clients.find(c => c.name?.toLowerCase().includes(searchName));
        if (client) {
          const clientInvoices = invoices.filter(i => i.client_id === client.id);
          const paidInvoices = clientInvoices.filter(i => i.status === 'paid');
          const totalPaid = paidInvoices.reduce((s, i) => s + (i.total || 0), 0);
          const totalPending = clientInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total || 0), 0);
          
          let avgDays = 0;
          paidInvoices.forEach(inv => {
            if (inv.paid_at) {
              const created = new Date(inv.created_at);
              const paid = new Date(inv.paid_at);
              avgDays += (paid - created) / (1000 * 60 * 60 * 24);
            }
          });
          avgDays = avgDays / (paidInvoices.length || 1);
          
          response = `👥 **CLIENT INSIGHTS: ${client.name}**\n\n📄 Total Invoices: ${clientInvoices.length}\n💰 Total Paid: $${totalPaid.toLocaleString()}\n⏳ Total Pending: $${totalPending.toLocaleString()}\n⏱️ Avg Payment Time: ${avgDays.toFixed(1)} days\n⚠️ Risk Level: ${avgDays > 30 ? 'HIGH' : (avgDays > 15 ? 'MEDIUM' : 'LOW')}\n\n💡 Recommendation: ${avgDays > 30 ? 'Request upfront payment' : 'Good payment history'}`;
        } else {
          response = `❌ Client "${clientMatch[1]}" not found.`;
        }
      } else {
        response = `👥 **YOUR CLIENTS**\n\n${clients.slice(0, 10).map(c => `• ${c.name}`).join('\n')}\n\nTo analyze a specific client, type "analyze client [name]"`;
      }
    }
    
    // REPORT
    else if (lower.includes('report') || lower.includes('how am i')) {
      response = `📊 **YOUR BUSINESS REPORT**\n\n💰 Revenue: $${paidRevenue.toLocaleString()}\n⏳ Pending: $${pendingRevenue.toLocaleString()}\n📉 Expenses: $${totalExpenses.toLocaleString()}\n📈 Profit: $${(paidRevenue - totalExpenses).toLocaleString()}\n📄 Invoices: ${invoices.length}\n👥 Clients: ${clients.length}\n\n${(paidRevenue - totalExpenses) > 0 ? '✅ Your business is profitable!' : '⚠️ Review your expenses.'}`;
    }
    
    // HELP
    else {
      response = `🤖 **AI COMMANDS**\n\n📊 "Show me my report" - Business summary\n📈 "Predict cash flow" - Future outlook\n📧 "Send reminders" - Payment follow-ups\n🔄 "Run recurring" - Process recurring invoices\n👥 "Analyze client [name]" - Client insights\n💡 "Client insights" - List all clients`;
    }
    
    return Response.json({ success: true, message: response });
    
  } catch (error) {
    console.error('AI Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
