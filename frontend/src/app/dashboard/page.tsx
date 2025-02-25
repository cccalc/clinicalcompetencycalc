'use client';

import Header from '@/components/header';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const Dashboard = () => {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setDisplayName(data.user.user_metadata.full_name || data.user.email);
      } else if (error) {
        console.error('Error fetching user:', error.message || error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <Header />
      <main className='container mx-auto p-4'>
        <h1 className='text-2xl font-bold'>Dashboard</h1>
        <p>Welcome, {displayName}</p>
      </main>
    </>
  );
};

export default Dashboard;
