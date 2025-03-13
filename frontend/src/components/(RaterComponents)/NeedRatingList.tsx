import { useState, useEffect } from 'react';
import { FaSortUp, FaSortDown } from 'react-icons/fa';

const RaterDashboard = () => {
  // Dummy data for student requests with notes
  const [requests, setRequests] = useState([
    {
      id: 1,
      student_name: 'John Doe',
      student_email: 'john.doe@example.com',
      date_requested: '2025-03-10',
      notes: 'Evaluate me on EPA 1 and 3. I have been struggling with patient handoffs and need detailed feedback.',
    },
    {
      id: 2,
      student_name: 'Jane Smith',
      student_email: 'jane.smith@example.com',
      date_requested: '2025-03-12',
      notes: 'I need feedback on procedural skills.',
    },
    {
      id: 3,
      student_name: 'Alice Johnson',
      student_email: 'alice.johnson@example.com',
      date_requested: '2025-03-11',
      notes: 'Focus on clinical reasoning.',
    },
    {
      id: 4,
      student_name: 'Bob Brown',
      student_email: 'bob.brown@example.com',
      date_requested: '2025-03-09',
      notes: 'Would like evaluation on patient communication.',
    },
    {
      id: 5,
      student_name: 'Charlie Davis',
      student_email: 'charlie.davis@example.com',
      date_requested: '2025-03-08',
      notes: 'Need detailed feedback on EPA 4.',
    },
    {
      id: 6,
      student_name: 'David Edwards',
      student_email: 'david.edwards@example.com',
      date_requested: '2025-03-07',
      notes: 'Looking for feedback on bedside manner.',
    },
    {
      id: 7,
      student_name: 'Ella Foster',
      student_email: 'ella.foster@example.com',
      date_requested: '2025-03-06',
      notes: 'Evaluate my ability to perform under pressure.',
    },
  ]);

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setRequests((prevRequests) =>
      [...prevRequests].sort((a, b) => new Date(a.date_requested).getTime() - new Date(b.date_requested).getTime())
    );
  }, []);

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setRequests((prevRequests) =>
      [...prevRequests].sort((a, b) =>
        newSortOrder === 'asc'
          ? new Date(a.date_requested).getTime() - new Date(b.date_requested).getTime()
          : new Date(b.date_requested).getTime() - new Date(a.date_requested).getTime()
      )
    );
  };

  return (
    <div className='container mt-4'>
      <div className='card p-3 border-0 bg-light'>
        <h1 className='mb-3 text-center text-primary'>Rater Dashboard</h1>
        <div className='d-flex justify-content-end mb-2'>
          <button className='btn btn-secondary' onClick={toggleSortOrder}>
            Sort by Date Requested {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
          </button>
        </div>
        <div className='card overflow-auto' style={{ maxHeight: '500px' }}>
          <div className='list-group'>
            {requests.map((request) => (
              <div
                key={request.id}
                className='list-group-item d-flex justify-content-between align-items-stretch p-3 mb-2 bg-white rounded shadow-sm'
              >
                <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h4 className='fw-bold text-dark'>{request.student_name}</h4>
                  <p className='text-muted small mb-0'>{request.student_email}</p>
                </div>
                <div
                  className='border rounded p-2 bg-light'
                  style={{
                    flex: '2',
                    minHeight: '100%',
                    overflowY: 'auto',
                    fontSize: '14px',
                    marginLeft: '10px',
                    padding: '10px',
                  }}
                >
                  <div className='text-secondary fw-bold mb-1'>Notes:</div>
                  <span>{request.notes || 'No notes provided'}</span>
                </div>
                <div className='d-flex flex-column justify-content-between align-items-end' style={{ flex: '1' }}>
                  <button className='btn btn-primary btn-md mb-2'>Evaluate</button>
                  <small className='text-muted mt-2'>{request.date_requested}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaterDashboard;
