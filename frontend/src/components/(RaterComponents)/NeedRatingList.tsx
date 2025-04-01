'use client';

import { useState, useEffect } from 'react';
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

const supabase = createClient();

const RaterDashboard = () => {
  interface FormRequest {
    id: string;
    created_at: string;
    student_id: string;
    display_name?: string;
    email?: string;
    clinical_settings: string;
    completed_by: string;
    notes: string;
    goals: string;
  }

  const { user } = useUser();
  const [formRequests, setFormRequests] = useState<FormRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchFormRequests = async () => {
      setLoading(true);

      const { data: formRequests, error: formError } = await supabase
        .from('form_requests')
        .select('*')
        .eq('completed_by', user.id);

      if (formError) {
        console.error('Error fetching form requests:', formError.message);
        setLoading(false);
        return;
      }

      if (!formRequests || formRequests.length === 0) {
        console.warn('Warning: No form requests returned.');
        setLoading(false);
        return;
      }

      const { data: users, error: userError } = await supabase.rpc('fetch_users');

      if (userError) {
        console.error('Error fetching users:', userError.message);
        setLoading(false);
        return;
      }

      const requests = formRequests.map((request) => {
        const student = users.find((user: { user_id: string }) => user.user_id === request.student_id);
        return {
          ...request,
          display_name: student?.display_name || 'Unknown',
          email: student?.email,
        };
      });

      setFormRequests(requests);
      setLoading(false);
    };

    fetchFormRequests();
  }, [user]);

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setFormRequests((prevRequests) =>
      [...prevRequests].sort((a, b) =>
        newSortOrder === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    );
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className='container mt-4'>
      <div className='card p-3 border-0 bg-light'>
        <h1 className='mb-3 text-center text-primary'>Rater Dashboard</h1>
        <div className='d-flex justify-content-end mb-2'>
          <button className='btn btn-secondary' onClick={toggleSortOrder}>
            Sort by Date Requested {sortOrder === 'asc' ? <FaSortUp data-testid="sort-up-icon" /> : <FaSortDown data-testid="sort-down-icon" />}
          </button>
        </div>
        <div className='card overflow-auto' style={{ maxHeight: '500px' }}>
          <div className='list-group'>
            {formRequests.map((request) => (
              <div
                key={request.id}
                className='list-group-item d-flex justify-content-between align-items-stretch p-3 mb-2 bg-white rounded shadow-sm'
              >
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h4 className='fw-bold text-dark' data-testid='request-item'> {request.display_name}</h4>
                  <p className='text-muted small mb-0'>{request.email}</p>
                  <p className='text-muted small mb-0'> Setting: {request.clinical_settings ?? 'N/A'}</p>
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
                  <div className='text-secondary fw-bold mb-1'>Relevant Activity:</div>
                  <span>{request.notes || 'No notes provided'}</span>
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
                  <div className='text-secondary fw-bold mb-1'>Stated Goals:</div>
                  <span>{request.goals || 'No notes provided'}</span>
                </div>
                <div className='d-flex flex-column justify-content-between align-items-end' style={{ flex: '1' }}>
                  <button
                    className='btn btn-primary btn-md mb-2'
                    onClick={() => router.push(`/dashboard/rater/form?id=${request.id}`)}
                  >
                    Evaluate
                  </button>
                  <small className='text-muted mt-2'>{new Date(request.created_at).toLocaleString()}</small>
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
