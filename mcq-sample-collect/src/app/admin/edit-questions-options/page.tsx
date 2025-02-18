'use server';

import Header from '@/components/header';
import type { Tables } from '@/utils/supabase/database.types';
import { createClient } from '@/utils/supabase/server';

import type { PostgrestMaybeSingleResponse } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export default async function Account() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) console.error(userError);

  const { data: roleData, error: roleError } = (await supabase
    .schema('public')
    .from('roles')
    .select('role')
    .eq('user_id', user?.id)
    .maybeSingle()) satisfies PostgrestMaybeSingleResponse<Tables<'roles'>>;

  if (roleError) console.error('Error retrieving role: ', roleError.message);

  if (!user || !roleData || roleData.role !== 'ccc_admin') redirect('/');

  return (
    <div className='d-flex flex-column min-vh-100'>
      <div className='row sticky-top'>
        <Header />
      </div>
      <div className='container p-5' style={{ maxWidth: '720px' }}>
        <h3>Edit form questions and options</h3>
      </div>
    </div>
  );
}
