import { createBrowserClient } from '@supabase/ssr';

export function createClient(options?: object) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  if (options) {
    return createBrowserClient(supabaseUrl, supabaseKey, options);
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
