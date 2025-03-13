'use client';

import { lazy, Suspense } from 'react';
import { useUser } from '@/context/UserContext';

const AdminDashboardPage = lazy(() => import('@/components/(AdminComponents)/adminDashboard'));
const RaterDashboard = lazy(() => import('@/components/(RaterComponents)/raterDashboard'));
const StudentDashboard = lazy(() => import('@/components/(StudentComponents)/studentDashboard'));

const Dashboard = () => {
  const { userRoleAuthorized, userRoleRater, displayName } = useUser();

  const renderDashboard = () => {
    if (userRoleAuthorized) {
      return <AdminDashboardPage />;
    } else if (userRoleRater) {
      return <RaterDashboard />;
    } else {
      return <StudentDashboard />;
    }
  };

  return (
    <>
      <main className='container mx-auto p-4'>
        <p className='h5'>Welcome, {displayName}</p>
        <Suspense fallback={<div>Loading...</div>}>{renderDashboard()}</Suspense>
      </main>
    </>
  );
};

export default Dashboard;
