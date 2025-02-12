'use client';

import {Dispatch, SetStateAction, useState} from 'react';

import Image from 'next/image';
import logo from '../components/ccc-logo-color.svg';

export default function EnterUsername({setUsername}: {setUsername: Dispatch<SetStateAction<string>>}) {
  const [tempUsername, setTempUsername] = useState<string>('');

  const handleSave = () => {
    setUsername(tempUsername);
    setTempUsername('');
    (document.getElementById('username-input')! as HTMLInputElement).value = '';
  };

  return (
    <div className='container-flex d-flex gap-3 flex-column justify-content-center align-items-center vh-100'>
      <div className='text-center'>
        <Image className='mb-3' src={logo} height={56} alt='CCC logo' />
        <h1 className='display-5'>Clinical Competency Calculator</h1>
        <p className='lead'>MCQ Sample Collection</p>
      </div>
      <div className='w-75'>
        <label htmlFor='username-input' className='form-label'>
          Enter your name
        </label>
        <input
          type='text'
          id='username-input'
          placeholder='John Doe'
          className='form-control'
          onChange={(e) => setTempUsername(e.target.value)}
        />
        <div className='form-text'>This name will be used to identify your submissions. You can change it later.</div>
      </div>
      <button type='button' className='btn btn-primary mt-3' onClick={handleSave} disabled={tempUsername.length === 0}>
        Start
        <i className='bi bi-arrow-right ms-2' />
      </button>
    </div>
  );
}
