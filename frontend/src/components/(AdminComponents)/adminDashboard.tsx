'use client';

import Notifications from '@/components/(AdminComponents)/notifications';
import AdminAnnouncements from './AdminAnnouncements';

const AdminDashboardPage = () => {
  return (
    <div className='d-flex gap-3 flex-wrap'>
      <Notifications />
      <AdminAnnouncements />
    </div>
  );
};

export default AdminDashboardPage;
