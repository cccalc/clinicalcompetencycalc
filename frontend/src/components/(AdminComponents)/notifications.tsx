'use client';

import { useState } from 'react';

// dummy notifications
const sampleNotifications = [
  { id: 1, type: 'Bias Alert', message: 'Possible rater bias detected in feedback.', timestamp: '10 mins ago' },
  { id: 2, type: 'Feedback Submitted', message: 'A new feedback form has been submitted.', timestamp: '30 mins ago' },
  { id: 3, type: 'Report Generated', message: 'A new competency report has been generated.', timestamp: '1 hour ago' },
  { id: 4, type: 'User Issue', message: 'A user reported a problem with their assessment.', timestamp: '2 hours ago' },
  { id: 5, type: 'System Alert', message: 'Scheduled maintenance is planned for 12 AM.', timestamp: '5 hours ago' },
  { id: 6, type: 'Bias Alert', message: 'Unusual rating pattern detected for a student.', timestamp: '8 hours ago' },
  {
    id: 7,
    type: 'Feedback Submitted',
    message: 'Multiple feedback forms have been submitted.',
    timestamp: '10 hours ago',
  },
  { id: 8, type: 'Report Generated', message: 'A new weekly analysis report is available.', timestamp: '12 hours ago' },
  { id: 9, type: 'User Issue', message: 'A rater reported an issue with form submission.', timestamp: '15 hours ago' },
  { id: 10, type: 'Feedback Submitted', message: 'Another feedback form received.', timestamp: '18 hours ago' },
  { id: 11, type: 'Bias Alert', message: 'A potential bias case flagged for review.', timestamp: '20 hours ago' },
  { id: 12, type: 'Report Generated', message: 'New monthly performance report ready.', timestamp: '1 day ago' },
];

const notificationColors: Record<string, string> = {
  'Bias Alert': 'danger',
  'Feedback Submitted': 'primary',
  'Report Generated': 'success',
  'User Issue': 'warning',
  'System Alert': 'info',
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [filter, setFilter] = useState<string | null>(null);

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = filter ? notifications.filter((n) => n.type === filter) : notifications;

  return (
    <div
      className='p-3 rounded'
      style={{ backgroundColor: '#f1f3f5', padding: '20px', borderRadius: '8px', maxWidth: '40vw', width: '100%' }}
    >
      <div className='card shadow-sm p-3 rounded border-0' style={{ backgroundColor: 'white' }}>
        <div
          className='card-header d-flex justify-content-between align-items-center bg-white border-bottom pb-2'
          style={{ position: 'sticky', top: 0, zIndex: 10 }}
        >
          <h5 className='m-0 text-dark'>Notifications</h5>
          <div className='dropdown'>
            <button
              className='btn btn-outline-secondary btn-sm dropdown-toggle'
              type='button'
              data-bs-toggle='dropdown'
            >
              <i className='bi bi-funnel'></i> Filter
            </button>
            <ul className='dropdown-menu'>
              <li>
                <button className='dropdown-item' onClick={() => setFilter(null)}>
                  All
                </button>
              </li>
              {Object.keys(notificationColors).map((type) => (
                <li key={type}>
                  <button className='dropdown-item' onClick={() => setFilter(type)}>
                    {type}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='card-body p-2' style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(({ id, type, message, timestamp }) => (
              <div
                key={id}
                className='d-flex align-items-center justify-content-between p-3 rounded mb-2'
                style={{ backgroundColor: 'white', border: '1px solid #dee2e6' }}
              >
                <div>
                  <span className={`badge bg-${notificationColors[type]}`}>{type}</span>
                  <p className='m-0 mt-1 small text-dark'>{message}</p>
                  <small className='text-muted'>{timestamp}</small>
                </div>
                <button className='btn btn-outline-danger btn-sm border-0' onClick={() => deleteNotification(id)}>
                  <i className='bi bi-trash'></i>
                </button>
              </div>
            ))
          ) : (
            <p className='text-center text-muted'>No notifications available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
