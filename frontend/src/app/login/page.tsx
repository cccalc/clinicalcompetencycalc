'use client';

import Image from 'next/image';
import { SyntheticEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import logo from '@/components/ccc-logo-color.svg';
import { login, signup } from './actions';
import { createClient } from '@/utils/supabase/client';

export default function Login() {
  const [emailValidationClass, setEmailValidationClass] = useState<string>('');
  const [passwordValidationClass, setPasswordValidationClass] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [alertColor, setAlertColor] = useState<string>('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (localStorage.getItem('redirectToDashboard') === 'true') {
      localStorage.removeItem('redirectToDashboard');
      router.push('/dashboard');
    }
  }, [router]);

  const validate = async (
    e: SyntheticEvent,
    authFunction: (formData: FormData) => Promise<{ alertColor: string; error: string }>
  ) => {
    e.preventDefault();
    let valid = true;

    const form = (e.target as HTMLButtonElement).form as HTMLFormElement;
    const email = form.email.value.trim();
    const password = form.password.value;

    // 🔹 Validate email
    if (typeof email !== 'string' || email.length === 0 || !email.includes('@')) {
      valid = false;
      setEmailValidationClass('is-invalid');
    } else {
      setEmailValidationClass('is-valid');
    }

    // 🔹 Validate password
    if (typeof password !== 'string' || password.length < 8) {
      valid = false;
      setPasswordValidationClass('is-invalid');
    } else {
      setPasswordValidationClass('is-valid');
    }

    if (valid) {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const { alertColor, error } = await authFunction(formData);
      setAlertColor(alertColor);
      setError(error);

      if (!error) {
        // ✅ Ensure session updates properly
        await supabase.auth.getSession();

        window.location.reload();
        localStorage.setItem('redirectToDashboard', 'true');
      }
    }
  };

  return (
    <div className='container d-flex flex-column justify-content-center gap-3 p-5 vh-100' style={{ maxWidth: '630px' }}>
      <div>
        <span>
          <Image className='mb-3' src={logo} height={32} alt='CCC logo' />
        </span>
        <h1 className='fs-2'>Clinical Competency Calculator</h1>
      </div>
      <form id='login-form' className='needs-validation' noValidate onSubmit={(e) => e.preventDefault()}>
        {/* Email Input */}
        <div className='form-floating mb-3'>
          <input
            id='email'
            className={`form-control ${emailValidationClass}`}
            type='email'
            required
            aria-required='true'
            placeholder='email@example.com'
            onChange={() => {
              setEmailValidationClass('');
              setError(null);
            }}
          />
          <label htmlFor='email' className='form-label'>
            Email
          </label>
          <div className='invalid-feedback'>Please enter a valid email address.</div>
        </div>

        {/* Password Input */}
        <div className='form-floating mb-3'>
          <input
            id='password'
            className={`form-control ${passwordValidationClass}`}
            type='password'
            required
            aria-required='true'
            placeholder='password'
            onChange={() => {
              setPasswordValidationClass('');
              setError(null);
            }}
          />
          <label htmlFor='password' className='form-label'>
            Password
          </label>
          <div className={`form-text ${passwordValidationClass === 'is-invalid' && 'd-none'}`}>
            Password must be at least 8 characters long.
          </div>
          <div className='invalid-feedback'>Password must be at least 8 characters long.</div>
        </div>

        {/* Error Alert */}
        <div className={`alert alert-${alertColor} ${error ? 'visible' : 'invisible'}`}>{error}</div>

        {/* Buttons */}
        <div className='d-flex justify-content-end gap-2'>
          <button id='signup' className='btn btn-outline-secondary' type='button' onClick={(e) => validate(e, signup)}>
            Sign Up
          </button>
          <button id='login' className='btn btn-primary' type='submit' onClick={(e) => validate(e, login)}>
            Login
          </button>
        </div>
      </form>
      <div className='pb-5'>{/* Spacing :) */}</div>
    </div>
  );
}
