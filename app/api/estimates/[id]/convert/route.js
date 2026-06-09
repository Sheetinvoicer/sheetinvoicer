import { createClient } from '@/lib/supabase/server';

export async function POST(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get the estimate
  const { data: estimate } = await supabase
    .from('estimates')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!estimate) {
    return Response.json({ error: 'Estimate not found' }, { status: 404 });
  }
  
  // Get next invoice number
  const { data: lastInvoice } = await supabase
    .from('invoices')
    .select('invoice_number')
    .order('created_at', { ascending: false })
    .limit(1);
  
  let nextNum = 1;
  if (lastInvoice && lastInvoice.length > 0) {
    const lastNum = parseInt(lastInvoice[0].invoice_number.replace('INV-', ''));
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }
  const invoiceNumber = `INV-${String(nextNum).padStart(6, '0')}`;
  
  // Create invoice from estimate - PRESERVE CURRENCY
  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      client_id: estimate.client_id,
      invoice_number: invoiceNumber,
      subtotal: estimate.subtotal,
      total: estimate.total,
      currency: estimate.currency,  // ← KEEP THE SAME CURRENCY
      notes: estimate.notes,
      status: 'draft'
    })
    .select()
    .single();
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  // Mark estimate as converted
  await supabase
    .from('estimates')
    .update({ 
      status: 'converted',
      converted_to_invoice_id: invoice.id 
    })
    .eq('id', id);
  
  return Response.json({ invoice });
}
