import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (!token) {
    return Response.json({ error: 'No token provided' }, { status: 400 });
  }
  
  const supabase = await createClient();
  
  // First, verify the token exists and is not expired
  const { data: session, error: sessionError } = await supabase
    .from('client_sessions')
    .select('*')
    .eq('token', token)
    .single();
  
  if (sessionError || !session) {
    console.error('Session error:', sessionError);
    return Response.json({ error: 'Invalid or expired link - session not found' }, { status: 401 });
  }
  
  // Check if expired
  if (new Date(session.expires_at) < new Date()) {
    return Response.json({ error: 'Link has expired' }, { status: 401 });
  }
  
  // Find the invoice for this client email
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (
        id,
        name,
        email
      )
    `)
    .eq('clients.email', session.client_email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (invoiceError) {
    console.error('Invoice error:', invoiceError);
    return Response.json({ error: 'No invoice found for this client' }, { status: 404 });
  }
  
  return Response.json(invoice);
}
