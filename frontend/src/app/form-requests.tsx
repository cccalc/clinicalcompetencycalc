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
      <main className='container mx-auto p-4'>
        <h1 className='text-2xl font-bold'>Form Requests</h1>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='faculty' className='block text-sm font-medium text-gray-700'>
              Select Faculty Member
            </label>
            <select
              id='faculty'
              name='faculty'
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
            >
              <option value=''>Select a faculty member</option>
              <option value='faculty1'>Faculty 1</option>
              <option value='faculty2'>Faculty 2</option>
              <option value='faculty3'>Faculty 3</option>
            </select>
          </div>
          <div>
            <label htmlFor='details' className='block text-sm font-medium text-gray-700'>
              Briefly describe the relevant activity or additional details
            </label>
            <textarea
              id='details'
              name='details'
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className='mt-1 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md'
            />
          </div>
          <div>
            <button
              type='submit'
              className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            >
              Submit
            </button>
          </div>
        </form>
      </main>
    </>
  );
};

export default FormRequests;
