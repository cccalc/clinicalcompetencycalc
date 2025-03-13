'use client';

import { useState } from 'react';

export default function FileInputForm() {
  type Error = 'extension' | 'format' | 'empty';
  const [error, setError] = useState<Error | null>(null);
  const [clearDisabled, setClearDisabled] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('empty');
      setClearDisabled(true);
      return;
    }

    setClearDisabled(false);

    if (file.type !== 'text/csv') {
      setError('extension');
      return;
    }

    setFile(file);
    setError(null);
  };

  const clearInput = () => {
    const inputElement = document.getElementById('text-csv') as HTMLInputElement;
    if (inputElement) inputElement.value = '';
    setFile(null);
    setError(null);
    setClearDisabled(true);
  };

  // const readFile = async (file: File): Promise<string | null> => {
  //   if (!file) return null;
  // };

  return (
    <>
      <div className='d-flex gap-2 mb-3'>
        <input className='form-control' type='file' name='text-csv' id='text-csv' onChange={handleFileChange} />
        <button className='btn btn-outline-secondary' disabled={clearDisabled} onClick={clearInput}>
          Clear
        </button>
      </div>
      <div className={`alert alert-danger ${error === 'extension' || 'd-none'}`}>
        The file is in the wrong format. Please upload a CSV file.
      </div>
      <div className={file ? '' : 'd-none'}>
        <h5 className='mt-4 mb-2'>Data preview</h5>
        <table className='table table-striped table-hover table-bordered' style={{ fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th scope='col'>text</th>
              <th scope='col'>epa</th>
              <th scope='col'>label</th>
            </tr>
          </thead>
        </table>
      </div>
    </>
  );
}
