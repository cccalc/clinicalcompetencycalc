'use client';

import { useEffect, useState, FormEvent } from 'react';
import Select, { SingleValue } from 'react-select';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

/**
 * OptionType defines the shape of values used by react-select
 * label: the text shown to the user
 * value: the value submitted (e.g. faculty ID or setting string)
 */
interface OptionType {
  label: string;
  value: string;
}

/**
 * FormRequests Component
 *
 * This component allows a student to request a faculty (rater) to complete
 * a clinical competency assessment form.
 *
 * - Fetches the current logged-in student
 * - Retrieves faculty and clinical setting options
 * - Uses react-select for searchable dropdowns
 * - Avoids hydration mismatch by rendering only after client mount
 */
const FormRequests = () => {
  // ----------------------
  // State Variables
  // ----------------------

  const [faculty, setFaculty] = useState<OptionType | null>(null);
  const [setting, setSetting] = useState<OptionType | null>(null);
  const [details, setDetails] = useState<string>('');
  const [goals, setGoals] = useState<string>('');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [facultyOptions, setFacultyOptions] = useState<OptionType[]>([]);
  const [settingOptions, setSettingOptions] = useState<OptionType[]>([]);

  const [mounted, setMounted] = useState<boolean>(false); // For hydration-safe rendering

  // ----------------------
  // Client Mount Effect (for hydration-safe rendering)
  // ----------------------

  useEffect(() => {
    setMounted(true);
  }, []);

  // ----------------------
  // Data Fetching on Mount
  // ----------------------

  useEffect(() => {
    const fetchCurrentUser = async (): Promise<void> => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error('Error fetching user:', error?.message ?? 'User not found');
        return;
      }

      setStudentId(user.id);
    };

    const fetchFaculty = async (): Promise<void> => {
      const { data: roles, error: roleErr } = await supabase.from('user_roles').select('user_id').eq('role', 'rater');

      if (roleErr || !roles) {
        console.error('Error fetching user roles:', roleErr?.message);
        return;
      }

      const userIds: string[] = roles.map((r: { user_id: string }) => r.user_id);

      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds)
        .eq('account_status', 'Active');

      if (profErr || !profiles) {
        console.error('Error fetching profiles:', profErr?.message);
        return;
      }

      const options: OptionType[] = profiles.map((p: { id: string; display_name: string }) => ({
        label: p.display_name,
        value: p.id,
      }));

      setFacultyOptions(options);
    };

    const fetchSettings = async (): Promise<void> => {
      const { data, error } = await supabase.from('clinical_settings').select('*');

      if (error || !data) {
        console.error('Error fetching clinical settings:', error?.message);
        return;
      }

      const options: OptionType[] = data.map((s: { id: string; setting: string }) => ({
        label: s.setting,
        value: s.setting,
      }));

      setSettingOptions(options);
    };

    fetchCurrentUser();
    fetchFaculty();
    fetchSettings();
  }, []);

  // ----------------------
  // Form Submission
  // ----------------------

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validation
    if (!faculty || !setting || !details) {
      setMessage('Please fill in all required fields.');
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
        completed_by: faculty.value,
        clinical_settings: setting.value,
        notes: details,
        goals: goals,
      },
    ]);

    if (error) {
      console.error('Insert error:', error.message);
      setMessage('Error submitting the form.');
    } else {
      setMessage('Form submitted successfully!');
      setFaculty(null);
      setSetting(null);
      setDetails('');
      setGoals('');
    }

    setLoading(false);
  };

  // ----------------------
  // Render
  // ----------------------

  return (
    <main className='container mt-5'>
      <h1 className='text-2xl font-bold mb-4'>Request Assessment</h1>

      {/* Avoid rendering react-select before client mounts to prevent hydration mismatch */}
      {!mounted ? (
        <p>Loading form...</p>
      ) : (
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Faculty Selector */}
          <div className='mb-3'>
            <label className='form-label'>Select Faculty</label>
            <Select
              options={facultyOptions}
              value={faculty}
              onChange={(option: SingleValue<OptionType>) => setFaculty(option)}
              placeholder='Search or select faculty'
              isSearchable
              classNamePrefix='react-select'
              menuPlacement='auto'
              menuPosition='absolute'
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            />
          </div>

          {/* Clinical Setting Selector */}
          <div className='mb-3'>
            <label className='form-label'>Clinical Setting</label>
            <Select
              options={settingOptions}
              value={setting}
              onChange={(option: SingleValue<OptionType>) => setSetting(option)}
              placeholder='Search or select setting'
              isSearchable
              classNamePrefix='react-select'
              menuPlacement='auto'
              menuPosition='absolute'
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            />
          </div>

          {/* Goals Textarea */}
          <div className='mb-3'>
            <label htmlFor='goals' className='form-label'>
              What I&apos;d like feedback on
            </label>
            <textarea
              id='goals'
              className='form-control'
              rows={4}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>

          {/* Notes Textarea */}
          <div className='mb-3'>
            <label htmlFor='details' className='form-label'>
              Additional notes
            </label>
            <textarea
              id='details'
              className='form-control'
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button type='submit' className='btn btn-primary' disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>

          {/* Message */}
          {message && <p className='mt-2 text-danger'>{message}</p>}
        </form>
      )}
    </main>
  );
};

export default FormRequests;
