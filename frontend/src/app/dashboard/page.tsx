'use client';

import { lazy, Suspense, useState } from 'react';
import { useUser } from '@/context/UserContext';

const AdminDashboardPage = lazy(() => import('@/components/(AdminComponents)/adminDashboard'));
const RaterDashboard = lazy(() => import('@/components/(RaterComponents)/raterDashboard'));
const StudentDashboard = lazy(() => import('@/components/(StudentComponents)/studentDashboard'));

const Dashboard = () => {
  const { userRoleAuthorized, userRoleRater, displayName, userRoleStudent, userRoleDev } = useUser();
  const [devView, setDevView] = useState<'admin' | 'rater' | 'student'>('admin');

  const renderDashboard = () => {
    if (userRoleDev) {
      switch (devView) {
        case 'admin':
          return <AdminDashboardPage />;
        case 'rater':
          return <RaterDashboard />;
        case 'student':
          return <StudentDashboard />;
      }
    }

    if (userRoleAuthorized) {
      return <AdminDashboardPage />;
    } else if (userRoleRater) {
      return <RaterDashboard />;
    } else if (userRoleStudent) {
      return <StudentDashboard />;
    }

    return <p>No role assigned.</p>;
  };

  return (
    <main className='container mx-auto p-4'>
      <p className='h5 mb-4'>Welcome, {displayName}</p>

      {userRoleDev && (
        <div className='mb-4'>
          <label htmlFor='devViewSelect' className='form-label'>
            Developer View:
          </label>
          <select
            id='devViewSelect'
            className='form-select w-auto'
            value={devView}
            onChange={(e) => setDevView(e.target.value as 'admin' | 'rater' | 'student')}
          >
            <option value='admin'>Admin Dashboard</option>
            <option value='rater'>Rater Dashboard</option>
            <option value='student'>Student Dashboard</option>
          </select>
        </div>
      )}

      <Suspense fallback={<div>Loading dashboard...</div>}>{renderDashboard()}</Suspense>
    </main>
  );
};

export default Dashboard;
