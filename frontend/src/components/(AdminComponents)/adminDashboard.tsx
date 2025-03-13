'use client';

import Notifications from '@/components/(AdminComponents)/notifications';

const AdminDashboardPage = () => {
  return (
    <>
      <h1>Hello, you are an admin.</h1>
      <p>Here you can manage users, view reports, and perform admin tasks.</p>
      <Notifications />
    </>
  );
};

export default AdminDashboardPage;
