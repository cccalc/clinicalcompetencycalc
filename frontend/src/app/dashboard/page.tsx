'use client';

import { useUser } from '@/context/UserContext';

const Dashboard = () => {
  const { displayName } = useUser();

  return (
    <>
      <main className='container mx-auto p-4'>
        <h1 className='text-2xl font-bold'>Dashboard</h1>
        <p>Welcome, {displayName}</p>
      </main>
    </>
  );
};

export default Dashboard;
