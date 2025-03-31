'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

/**
 * FormRequests Component
 *
 * Allows a student to request a faculty/rater to complete a clinical competency assessment form.
 * - Fetches the currently logged-in student
 * - Lists available faculty (raters)
 * - Submits a form request with optional goals and notes
 */
const FormRequests = () => {
  // ----------------------
  // State Variables
  // ----------------------

  const [faculty, setFaculty] = useState<string>(''); // Selected rater/faculty ID
  const [details, setDetails] = useState<string>(''); // Additional notes
  const [goals, setGoals] = useState<string>(''); // Feedback request/goals
  const [users, setUsers] = useState<{ user_id: string; display_name: string }[]>([]); // Raters list
  const [studentId, setStudentId] = useState<string | null>(null); // Logged-in student ID
  const [loading, setLoading] = useState<boolean>(false); // Submission status
  const [message, setMessage] = useState<string>(''); // Feedback message

  // ----------------------
  // Initial Data Load
  // ----------------------

  useEffect(() => {
    /**
     * Retrieves the currently logged-in Supabase user and stores the student ID.
     */
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

    /**
     * Fetches all users with the 'rater' role and retrieves their display names.
     */
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
        .in('id', userIds)
        .eq('account_status', 'Active'); // Ensures only active profiles are retrieved

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

  // ----------------------
  // Form Submission
  // ----------------------

  /**
   * Handles form submission to Supabase.
   * Inserts a new record in the `form_requests` table.
   *
   * @param {React.FormEvent} e - Form event object
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
        goals: goals,
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

  // ----------------------
  // Render
  // ----------------------

  return (
    <main className='container mt-5'>
      <h1 className='text-2xl font-bold mb-4'>Request Assessment</h1>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Faculty Selector */}
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

        {/* Feedback Goals Textarea */}
        <div className='mb-3'>
          <label htmlFor='goals' className='form-label'>
            What I&apos;d like feedback on
          </label>
          <textarea
            id='goals'
            name='goals'
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={4}
            className='form-control'
          />
        </div>

        {/* Additional Notes Textarea */}
        <div className='mb-3'>
          <label htmlFor='details' className='form-label'>
            Additional notes:
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

        {/* Submit Button */}
        <div>
          <button type='submit' className='btn btn-primary' disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {/* Submission Message */}
        {message && <p className='text-red-500 mt-2'>{message}</p>}
      </form>
    </main>
  );
};

export default FormRequests;
