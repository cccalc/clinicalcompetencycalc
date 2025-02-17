'use client';
import { createClient } from '@/utils/supabase/client';
import { type User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

// ...

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [displayname, setDisplayname] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`display_name`)
        .eq('id', user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        setDisplayname(data.display_name);
      }
    } catch (error) {
      alert(`Error loading user data: ${JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]); // getProfile ====================

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  async function updateProfile({ displayname }: { displayname: string | null }) {
    try {
      setLoading(true);

      const { error } = await supabase.from('profiles').upsert({
        id: user?.id,
        display_name: displayname,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (error) {
      alert(`Error updating the data: ${JSON.stringify(error)}`);
      console.log(user?.id, displayname, new Date().toISOString());
    } finally {
      setLoading(false);
    }
  } // updateProfile ====================

  return (
    <>
      <form id='account-form' className='pb-3'>
        <div className='form-floating mb-3'>
          <input id='email' className='form-control-plaintext' placeholder='email' value={user?.email} readOnly />
          <label htmlFor='email' className='form-label'>
            Email
          </label>
        </div>
        <div className='form-floating mb-3'>
          <input
            id='fullName'
            className='form-control'
            type='text'
            placeholder='John Doe'
            value={displayname ?? ''}
            onChange={(e) => setDisplayname(e.target.value)}
          />
          <label htmlFor='fullName' className='form-label'>
            Display name
          </label>
        </div>
      </form>
      <div className='mb-3'>
        <div>
          <button className='btn btn-primary' onClick={() => updateProfile({ displayname })} disabled={loading}>
            {loading ? 'Loading ...' : 'Update'}
          </button>
        </div>
      </div>
      <div className='mb-3'>
        <form action='/auth/signout' method='post'>
          <button className='btn btn-danger' type='submit'>
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}
