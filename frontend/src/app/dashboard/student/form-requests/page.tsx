'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; 

const supabase = createClient(); 

const FormRequests = () => {
  const [faculty, setFaculty] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [users, setUsers] = useState<{ user_id: string; display_name: string }[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error fetching user:', userError.message);
        return;
      }

      if (!user) {
        console.error('User not found');
        return;
      }

      setStudentId(user.id);
    };

    const fetchUsersWithDisplayNames = async () => {
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'rater');

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError.message);
        return;
      }

      if (!userRoles || userRoles.length === 0) {
        setUsers([]);
        return;
      }

      const userIds = userRoles.map((user) => user.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError.message);
        return;
      }

      const usersWithNames = userRoles.map((user) => ({
        user_id: user.user_id,
        display_name:
          profiles.find((profile) => profile.id === user.user_id)?.display_name || 'Unknown',
      }));

      setUsers(usersWithNames);
    };

    fetchCurrentUser();
    fetchUsersWithDisplayNames();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faculty || !details) {
      setMessage('Please fill in all fields.');
      return;
    }

    if (!studentId) {
      setMessage('Error: Unable to determine student ID.');
      return;
    }

    setLoading(true);
    setMessage('');

    const { error } = await supabase.from('form_requests').insert([
      {
        student_id: studentId, 
        notes: details, 
        completed_by: faculty, 
      },
    ]);

    if (error) {
      console.error('Error inserting form request:', error.message);
      setMessage('Error submitting the form. Please try again.');
    } else {
      setMessage('Form submitted successfully!');
      setDetails('');
      setFaculty('');
    }

    setLoading(false);
  };

  return (
    <>
      <main className='container mt-5'>
        <h1 className='text-2xl font-bold mb-4'>Form Requests</h1>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='mb-3'>
            <label htmlFor='faculty' className='form-label'>
              Select Faculty
            </label>
            <select
              id='faculty'
              name='faculty'
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className='form-select'
            >
              <option value=''>Select a faculty</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.display_name}
                </option>
              ))}
            </select>
          </div>
          <div className='mb-3'>
            <label htmlFor='details' className='form-label'>
              Briefly describe the relevant activity or additional details
            </label>
            <textarea
              id='details'
              name='details'
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className='form-control'
            />
          </div>
          <div>
            <button type='submit' className='btn btn-primary' disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          {message && <p className='text-red-500 mt-2'>{message}</p>}
        </form>
      </main>
    </>
  );
};

export default FormRequests;
