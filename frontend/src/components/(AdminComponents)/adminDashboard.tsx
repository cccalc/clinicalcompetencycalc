'use client';

import Notifications from '@/components/(AdminComponents)/notifications';
import AdminAnnouncements from './AdminAnnouncements';
import AdminSettingsButtons from './AdminSettingsButtons';

const AdminDashboardPage = () => {
  return (
    <div className='d-flex gap-3 flex-wrap'>
      <Notifications />
      <AdminSettingsButtons />
      <AdminAnnouncements />
    </div>
  );
};

export default AdminDashboardPage;
