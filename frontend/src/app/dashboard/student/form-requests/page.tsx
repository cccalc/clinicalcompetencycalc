'use client';

import { useEffect, useState, FormEvent } from 'react';
import Select, { SingleValue } from 'react-select';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface OptionType {
  label: string;
  value: string;
}

const FormRequests = () => {
  const [faculty, setFaculty] = useState<OptionType | null>(null);
  const [setting, setSetting] = useState<OptionType | null>(null);
  const [details, setDetails] = useState('');
  const [goals, setGoals] = useState('');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [facultyOptions, setFacultyOptions] = useState<OptionType[]>([]);
  const [settingOptions, setSettingOptions] = useState<OptionType[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
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

    const fetchFaculty = async () => {
      const { data: roles, error: roleErr } = await supabase.from('user_roles').select('user_id').eq('role', 'rater');
      if (roleErr || !roles) return;

      const userIds = roles.map((r) => r.user_id);
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds)
        .eq('account_status', 'Active');

      if (profErr || !profiles) return;

      setFacultyOptions(profiles.map((p) => ({ label: p.display_name, value: p.id })));
    };

    const fetchSettings = async () => {
      const { data, error } = await supabase.from('clinical_settings').select('*');
      if (error || !data) return;

      setSettingOptions(data.map((s) => ({ label: s.setting, value: s.setting })));
    };

    fetchCurrentUser();
    fetchFaculty();
    fetchSettings();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!faculty || !setting || !details.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!studentId) {
      setMessage({ type: 'error', text: 'Unable to determine student ID.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.from('form_requests').insert([
      {
        student_id: studentId,
        completed_by: faculty.value,
        clinical_settings: setting.value,
        notes: details,
        goals,
      },
    ]);

    if (error) {
      console.error('Insert error:', error.message);
      setMessage({ type: 'error', text: 'Error submitting the form. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Form submitted successfully!' });
      setFaculty(null);
      setSetting(null);
      setDetails('');
      setGoals('');
    }

    setLoading(false);
  };

  return (
    <main className='container mt-5'>
      <div className='card shadow-sm p-4'>
        <h2 className='mb-4 fw-semibold'>Request Assessment</h2>

        {!mounted ? (
          <p>Loading form...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Faculty Selector */}
            <div className='mb-3'>
              <label className='form-label'>Select Faculty *</label>
              <Select
                options={facultyOptions}
                value={faculty}
                onChange={(option: SingleValue<OptionType>) => setFaculty(option)}
                placeholder='Search or select faculty'
                isSearchable
                classNamePrefix='react-select'
                menuPlacement='auto'
                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                isDisabled={loading}
              />
            </div>

            {/* Clinical Setting Selector */}
            <div className='mb-3'>
              <label className='form-label'>Clinical Setting *</label>
              <Select
                options={settingOptions}
                value={setting}
                onChange={(option: SingleValue<OptionType>) => setSetting(option)}
                placeholder='Search or select setting'
                isSearchable
                classNamePrefix='react-select'
                menuPlacement='auto'
                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                isDisabled={loading}
              />
            </div>

            {/* Goals */}
            <div className='mb-3'>
              <label htmlFor='goals' className='form-label'>
                What I&apos;d like feedback on (optional)
              </label>
              <textarea
                id='goals'
                className='form-control'
                rows={3}
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Notes */}
            <div className='mb-3'>
              <label htmlFor='details' className='form-label'>
                Additional Notes *
              </label>
              <textarea
                id='details'
                className='form-control'
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className='d-flex justify-content-between align-items-center'>
              <button type='submit' className='btn btn-primary' disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>

              {message && (
                <span className={`fw-semibold ${message.type === 'success' ? 'text-success' : 'text-danger'}`}>
                  {message.text}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default FormRequests;
