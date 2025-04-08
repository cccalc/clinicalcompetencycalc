'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface ReportGenerationFormProps {
  studentId: string;
  onGenerated: () => void;
}

const ReportGenerationForm: React.FC<ReportGenerationFormProps> = ({ studentId, onGenerated }) => {
  const [title, setTitle] = useState<string>('');
  const [timeRange, setTimeRange] = useState<3 | 6 | 12>(3);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const generateReport = async (): Promise<void> => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.rpc('generate_student_report', {
        student_id_input: studentId,
        time_range_input: timeRange,
        report_title: title,
      });

      if (error) throw error;

      setSuccess(true);
      setTitle('');
      onGenerated(); // notify parent component
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='card p-3'>
      <h5 className='mb-3'>Generate New Report</h5>

      <div className='mb-3'>
        <label className='form-label'>Report Title</label>
        <input
          type='text'
          className='form-control'
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder='Enter report name'
        />
      </div>

      <div className='mb-3'>
        <label className='form-label'>Time Range</label>
        <div className='btn-group' role='group'>
          {[3, 6, 12].map((value) => (
            <button
              key={value}
              type='button'
              className={`btn btn-outline-primary${timeRange === value ? ' active' : ''}`}
              onClick={() => setTimeRange(value as 3 | 6 | 12)}
            >
              Last {value} mo
            </button>
          ))}
        </div>
      </div>

      <button className='btn btn-success' onClick={generateReport} disabled={loading || title.trim() === ''}>
        {loading ? 'Generating...' : 'Generate Report'}
      </button>

      {success && <p className='text-success mt-2'>Report generated successfully.</p>}
      {error && <p className='text-danger mt-2'>Error: {error}</p>}
    </div>
  );
};

export default ReportGenerationForm;
