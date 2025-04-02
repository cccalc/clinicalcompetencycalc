'use client';

import Notifications from '@/components/(AdminComponents)/notifications';
import AdminAnnouncements from './AdminAnnouncements';
import AdminSettingsButtons from './AdminSettingsButtons';

const AdminDashboardPage = () => {
  return (
    <div className='d-flex flex-wrap flex-md-nowrap gap-3 w-100'>
      {/* Left column: notifications + settings */}
      <div className='d-flex flex-column gap-3 flex-grow-1' style={{ minWidth: '300px' }}>
        <Notifications />
        <AdminSettingsButtons />
      </div>

      {/* Right column: announcements */}
      <div className='flex-grow-1' style={{ minWidth: '500px' }}>
        <AdminAnnouncements />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
