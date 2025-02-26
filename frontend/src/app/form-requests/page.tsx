'use client';

import Header from '@/components/header';
import { useState } from 'react';

const FormRequests = () => {
  const [faculty, setFaculty] = useState<string>('');
  const [details, setDetails] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Faculty:', faculty);
    console.log('Details:', details);
  };

  return (
    <>
      <Header />
      <main className='container mt-5'>
        <h1 className='text-2xl font-bold mb-4'>Form Requests</h1>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='mb-3'>
            <label htmlFor='faculty' className='form-label'>
              Select Faculty Member
            </label>
            <select
              id='faculty'
              name='faculty'
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className='form-select'
            >
              <option value=''>Select a faculty member</option>
              <option value='faculty1'>Faculty 1</option>
              <option value='faculty2'>Faculty 2</option>
              <option value='faculty3'>Faculty 3</option>
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
            <button type='submit' className='btn btn-primary'>
              Submit
            </button>
          </div>
        </form>
      </main>
    </>
  );
};

export default FormRequests;
