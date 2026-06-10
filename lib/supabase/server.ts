import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase credentials, using mock client');
    // Return mock client for build time
    return {
      auth: {
        getUser: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null })
      },
      from: (table: string) => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: (data: any) => Promise.resolve({ data, error: null }),
        update: (data: any) => Promise.resolve({ data, error: null }),
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    };
  }
  
  return createSupabaseClient(supabaseUrl, supabaseKey);
}
