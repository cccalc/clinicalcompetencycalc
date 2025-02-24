'use client';

import Header from '@/components/header';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const Dashboard = () => {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setDisplayName(data.user.user_metadata.full_name || data.user.email);
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
