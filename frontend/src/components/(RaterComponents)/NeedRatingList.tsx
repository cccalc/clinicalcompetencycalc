'use client';

import { useState, useEffect } from 'react';
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client'; 
import { useUser } from '@/context/UserContext'; 

const supabase = createClient(); 

interface FormRequest {
  id: string;
  created_at: string;
  student_id: string;
  display_name?: string; 
  completed_by: string;
  notes: string;
}

const RaterDashboard = () => {
  const { user } = useUser(); 
  const [formRequests, setFormRequests] = useState<FormRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!user) return; 

    const fetchFormRequestsWithNames = async () => {
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

      const studentIds = formRequests.map((req) => req.student_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', studentIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError.message);
        setLoading(false);
        return;
      }

      const requestsWithNames = formRequests.map((request) => ({
        ...request,
        display_name: profiles.find((profile) => profile.id === request.student_id)?.display_name || 'Unknown',
      }));

      setFormRequests(requestsWithNames);
      setLoading(false);
    };

    fetchFormRequestsWithNames();
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
    <div className="container mt-4">
      <div className="card p-3 border-0 bg-light">
        <h1 className="mb-3 text-center text-primary">Rater Dashboard</h1>
        <div className="d-flex justify-content-end mb-2">
          <button className="btn btn-secondary" onClick={toggleSortOrder}>
            Sort by Date Requested {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
          </button>
        </div>
        <div className="card overflow-auto" style={{ maxHeight: '500px' }}>
          <div className="list-group">
            {formRequests.map((request) => (
              <div
                key={request.id}
                className="list-group-item d-flex justify-content-between align-items-stretch p-3 mb-2 bg-white rounded shadow-sm"
              >
                <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h4 className="fw-bold text-dark"> {request.display_name}</h4>
                </div>
                <div
                  className="border rounded p-2 bg-light"
                  style={{
                    flex: '2',
                    minHeight: '100%',
                    overflowY: 'auto',
                    fontSize: '14px',
                    marginLeft: '10px',
                    padding: '10px',
                  }}
                >
                  <div className="text-secondary fw-bold mb-1">Notes:</div>
                  <span>{request.notes || 'No notes provided'}</span>
                </div>
                <div className="d-flex flex-column justify-content-between align-items-end" style={{ flex: '1' }}>
                  <button className="btn btn-primary btn-md mb-2">Evaluate</button>
                  <small className="text-muted mt-2">{new Date(request.created_at).toLocaleString()}</small>
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
