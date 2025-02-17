'use server';

import Header from '@/components/header';
import { createClient } from '@/utils/supabase/server';

import AccountForm from './account-form';

export default async function Account() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className='d-flex flex-column min-vh-100'>
      <div className='row sticky-top'>
        <Header />
      </div>
      <div className='container p-5' style={{ maxWidth: '720px' }}>
        <AccountForm user={user} />
      </div>
    </div>
  );
}
