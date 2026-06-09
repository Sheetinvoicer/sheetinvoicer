import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { data: estimates, error } = await supabase
    .from('estimates')
    .select('*, clients(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json(estimates);
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  console.log('Creating estimate with currency:', body.currency);
  
  // Get next estimate number
  const { data: lastEstimate } = await supabase
    .from('estimates')
    .select('estimate_number')
    .order('created_at', { ascending: false })
    .limit(1);
  
  let nextNum = 1;
  if (lastEstimate && lastEstimate.length > 0) {
    const lastNum = parseInt(lastEstimate[0].estimate_number.replace('EST-', ''));
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }
  const estimateNumber = `EST-${String(nextNum).padStart(6, '0')}`;
  
  const estimateData = {
    user_id: user.id,
    client_id: body.client_id,
    estimate_number: estimateNumber,
    subtotal: body.subtotal || 0,
    total: body.total || 0,
    currency: body.currency || 'USD',
    notes: body.notes || '',
    status: 'draft'
  };
  
  const { data: estimate, error } = await supabase
    .from('estimates')
    .insert(estimateData)
    .select()
    .single();
  
  if (error) {
    console.error('Insert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  console.log('Estimate created with currency:', estimate.currency);
  return Response.json(estimate);
}
