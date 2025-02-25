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
          <div className='d-flex gap-3'>
            <Link className='text-reset' href='/'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='32'
                height='32'
                fill='currentColor'
                className='bi bi-house'
                viewBox='0 0 16 16'
              >
                <path d='M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z' />
              </svg>
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
                  fillRule='evenodd'
                  d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1'
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
