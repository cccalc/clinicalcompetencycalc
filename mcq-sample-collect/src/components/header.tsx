import Image from 'next/image';
import Link from 'next/link';

import logo from './ccc-logo-white.svg';

export default function Header() {
  return (
    <>
      <div className='bg-secondary text-white p-3'>
        <div className='container-flex mx-3 d-flex gap-2 justify-content-between align-items-center'>
          <Link
            className='d-flex align-items-center text-reset text-decoration-none'
            href='/'
            style={{ minWidth: '0' }}
          >
            <Image className='me-2' src={logo} height={32} alt='CCC Logo' />
            <span className='d-inline-block text-truncate lh-sm'>
              Clinical Competency <br /> Calculator
            </span>
          </Link>
          <Link className='text-reset' href='/account'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='32'
              height='32'
              fill='currentColor'
              className='bi bi-person-circle'
              viewBox='0 0 16 16'
            >
              <path d='M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0' />
              <path
                fill-rule='evenodd'
                d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1'
              />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
