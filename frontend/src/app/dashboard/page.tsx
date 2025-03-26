'use client';

import { lazy, Suspense, useState } from 'react';
import { useUser } from '@/context/UserContext';

// Lazy load each role-based dashboard component
const AdminDashboardPage = lazy(() => import('@/components/(AdminComponents)/adminDashboard'));
const RaterDashboard = lazy(() => import('@/components/(RaterComponents)/raterDashboard'));
const StudentDashboard = lazy(() => import('@/components/(StudentComponents)/studentDashboard'));

/**
 * Dashboard component
 *
 * Renders the appropriate dashboard based on the user's role:
 * - Admins see the AdminDashboardPage
 * - Raters see the RaterDashboard
 * - Students see the StudentDashboard
 * - Developers can toggle between all three views
 */
const Dashboard = () => {
  const { userRoleAuthorized, userRoleRater, displayName, userRoleStudent, userRoleDev } = useUser();
  const [devView, setDevView] = useState<'admin' | 'rater' | 'student'>('admin');

  /**
   * Determines which dashboard to render based on user role or dev override
   * @returns JSX.Element - The correct dashboard component
   */
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
    } else if (userRoleDev) {
      return (
        <>
          <AdminDashboardPage />
          <RaterDashboard />
          <StudentDashboard />
        </>
      );
    }

    return <p>No role assigned.</p>;
  };

  return (
    <main className='container mx-auto p-4'>
      {/* Greeting */}
      <p className='h5 mb-4'>Welcome, {displayName}</p>

      {/* Developer-only view toggle */}
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

      {/* Lazy-loaded dashboard with fallback */}
      <Suspense fallback={<div>Loading dashboard...</div>}>{renderDashboard()}</Suspense>
    </main>
  );
};

export default Dashboard;
