'use client';

import { lazy, Suspense } from 'react';
import { useUser } from '@/context/UserContext';

const AdminDashboardPage = lazy(() => import('@/components/(AdminComponents)/adminDashboard'));
const RaterDashboard = lazy(() => import('@/components/(RaterComponents)/raterDashboard'));
const StudentDashboard = lazy(() => import('@/components/(StudentComponents)/studentDashboard'));

const Dashboard = () => {
  const { userRoleAuthorized, userRoleRater, displayName, userRoleStudent } = useUser();

  return (
    <>
      <main className='container mx-auto p-4'>
        <p className='h5'>Welcome, {displayName}</p>
        <Suspense fallback={<div>Loading...</div>}>
          {userRoleAuthorized && <AdminDashboardPage />}
          {userRoleRater && <RaterDashboard />}
          {userRoleStudent && <StudentDashboard />}
        </Suspense>
      </main>
    </>
  );
};

export default Dashboard;
