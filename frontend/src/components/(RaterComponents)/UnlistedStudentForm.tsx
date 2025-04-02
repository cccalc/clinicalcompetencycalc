'use client';

import { useState, useEffect, FormEvent } from 'react';
import Select, { SingleValue } from 'react-select';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface OptionType {
  label: string;
  value: string;
}

interface Props {
  raterId: string;
  existingRequests: { student_id: string; completed_by: string }[];
  onSuccess: (newRequestId: string) => void;
}

const UnlistedStudentForm = ({ raterId, existingRequests, onSuccess }: Props) => {
  const [student, setStudent] = useState<OptionType | null>(null);
  const [setting, setSetting] = useState<OptionType | null>(null);
  const [details, setDetails] = useState('');
  const [goals, setGoals] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentOptions, setStudentOptions] = useState<OptionType[]>([]);
  const [settingOptions, setSettingOptions] = useState<OptionType[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'student');
      const ids = roles?.map((r) => r.user_id) ?? [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', ids)
        .eq('account_status', 'Active');

      const options = profiles?.map((p) => ({ label: p.display_name, value: p.id })) ?? [];
      setStudentOptions(options);
    };

    const fetchSettings = async () => {
      const { data } = await supabase.from('clinical_settings').select('*');
      const options = data?.map((s) => ({ label: s.setting, value: s.setting })) ?? [];
      setSettingOptions(options);
    };

    fetchStudents();
    fetchSettings();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!student || !setting || !details) {
      setMessage('All fields are required.');
      return;
    }

    const alreadyExists = existingRequests.some(
      (req) => req.student_id === student.value && req.completed_by === raterId
    );

    if (alreadyExists) {
      setMessage('This student has already requested you. Please check your dashboard.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('form_requests')
      .insert([
        {
          student_id: student.value,
          completed_by: raterId,
          clinical_settings: setting.value,
          notes: details,
          goals,
        },
      ])
      .select('id')
      .single();

    if (error || !data) {
      console.error(error?.message);
      setMessage('Error submitting form.');
    } else {
      onSuccess(data.id);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-3'>
        <label className='form-label'>Select Student</label>
        <Select
          options={studentOptions}
          value={student}
          onChange={(option: SingleValue<OptionType>) => setStudent(option)}
          placeholder='Search student...'
        />
      </div>

      <div className='mb-3'>
        <label className='form-label'>Clinical Setting</label>
        <Select
          options={settingOptions}
          value={setting}
          onChange={(option: SingleValue<OptionType>) => setSetting(option)}
          placeholder='Search setting...'
        />
      </div>

      <div className='mb-3'>
        <label className='form-label'>Student Goal(s)</label>
        <textarea className='form-control' rows={3} value={goals} onChange={(e) => setGoals(e.target.value)} />
      </div>

      <div className='mb-3'>
        <label className='form-label'>Additional notes</label>
        <textarea className='form-control' rows={3} value={details} onChange={(e) => setDetails(e.target.value)} />
      </div>

      <button type='submit' className='btn btn-primary' disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>

      {message && <p className='mt-2 text-danger'>{message}</p>}
    </form>
  );
};

export default UnlistedStudentForm;
