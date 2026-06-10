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
    
    // Fetch ALL data directly
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id);
    
    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id);
    
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id);
    
    console.log('Invoices found:', invoices?.length);
    console.log('First invoice:', invoices?.[0]);
    
    // Calculate metrics safely
    const paidInvoices = invoices?.filter(i => i.status === 'paid') || [];
    const pendingInvoices = invoices?.filter(i => i.status !== 'paid') || [];
    const overdueInvoices = invoices?.filter(i => {
      return i.status !== 'paid' && i.due_date && new Date(i.due_date) < new Date();
    }) || [];
    
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const totalPending = pendingInvoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const totalExpenses = expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;
    
    let responseText = '';
    
    if (lower.includes('report') || lower.includes('how am i')) {
      responseText = `📊 YOUR BUSINESS REPORT\n\n` +
        `💰 Revenue: $${totalRevenue.toLocaleString()}\n` +
        `⏳ Pending: $${totalPending.toLocaleString()}\n` +
        `📉 Expenses: $${totalExpenses.toLocaleString()}\n` +
        `📈 Profit: $${(totalRevenue - totalExpenses).toLocaleString()}\n` +
        `📄 Invoices: ${invoices?.length || 0}\n` +
        `✅ Paid: ${paidInvoices.length}\n` +
        `⚠️ Overdue: ${overdueInvoices.length}\n` +
        `👥 Clients: ${clients?.length || 0}\n\n` +
        `${(totalRevenue - totalExpenses) > 0 ? '✅ Your business is profitable!' : '⚠️ Review your expenses.'}`;
    } 
    else if (lower.includes('invoices') || lower.includes('list invoices')) {
      if (!invoices || invoices.length === 0) {
        responseText = "📄 No invoices found. Create your first invoice from the Invoices page!";
      } else {
        responseText = `📄 YOUR INVOICES (${invoices.length})\n\n` +
          invoices.slice(0, 5).map(inv => 
            `• ${inv.invoice_number}: ${inv.currency || 'USD'} ${Number(inv.total).toFixed(2)} (${inv.status || 'draft'})`
          ).join('\n');
        if (invoices.length > 5) {
          responseText += `\n\n... and ${invoices.length - 5} more`;
        }
      }
    }
    else {
      responseText = `🤖 AI COMMANDS\n\n` +
        `📊 "Show me my report" - Business summary\n` +
        `📄 "List my invoices" - See all invoices\n` +
        `📈 "Predict cash flow" - Future outlook\n` +
        `📧 "Send reminders" - Payment follow-ups\n` +
        `👥 "List my clients" - See all clients`;
    }
    
    return Response.json({ success: true, message: responseText });
    
  } catch (error) {
    console.error('AI Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
