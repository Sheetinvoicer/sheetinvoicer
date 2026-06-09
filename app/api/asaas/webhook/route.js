import { asaasMCP } from '@/lib/asaas/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  const payload = await request.json();
  const result = await asaasMCP.handleWebhook(payload);
  return Response.json(result);
}
