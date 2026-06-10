import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { message } = await request.json();
    const lower = message.toLowerCase();
    
    // Fetch real data
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
    
    let responseText = '';
    
    if (lower.includes('report') || lower.includes('how am i')) {
      responseText = `📊 YOUR BUSINESS REPORT\n\n💰 Revenue: $${paidRevenue.toLocaleString()}\n⏳ Pending: $${pendingRevenue.toLocaleString()}\n📉 Expenses: $${totalExpenses.toLocaleString()}\n📈 Profit: $${(paidRevenue - totalExpenses).toLocaleString()}\n📄 Invoices: ${invoices.length}\n👥 Clients: ${clients.length}\n\n${(paidRevenue - totalExpenses) > 0 ? '✅ Your business is profitable!' : '⚠️ Review your expenses.'}`;
    } else {
      responseText = `🤖 AI COMMANDS\n\n📊 "Show me my report" - Business summary\n📈 "Predict cash flow" - Future outlook\n📧 "Send reminders" - Payment follow-ups\n👥 "Analyze client [name]" - Client insights`;
    }
    
    return new Response(JSON.stringify({ success: true, message: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Also handle OPTIONS for CORS if needed
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
