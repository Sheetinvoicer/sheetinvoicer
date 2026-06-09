import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  // Unwrap params (it's a Promise in Next.js 16)
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: estimate, error } = await supabase
    .from('estimates')
    .select('*, clients(*)')
    .eq('id', id)
    .single();
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json(estimate);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();
  
  const { data: estimate, error } = await supabase
    .from('estimates')
    .update(body)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json(estimate);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('estimates')
    .delete()
    .eq('id', id);
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json({ success: true });
}
