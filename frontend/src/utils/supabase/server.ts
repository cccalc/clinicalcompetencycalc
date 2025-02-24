'use server';

import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';

const supabaseurl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasekey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createClient(options?: object) {
  const cookieStore = await cookies();

  // Create a server's supabase client with newly configured cookie,
  // which could be used to maintain user's session

  return createServerClient(supabaseurl!, supabasekey!, {
    ...(options ?? {}),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
