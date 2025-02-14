import {Dispatch, SetStateAction} from 'react';

import Image from 'next/image';
import logo from './ccc-logo-white.svg';

export default function Header({username}: {username: string}) {
  return (
    <>
      <div className='bg-secondary text-white p-3'>
        <div className='container-flex mx-3 d-flex gap-2 justify-content-between align-items-center'>
          <div className='d-flex align-items-center' style={{minWidth: '0'}}>
            <Image className='me-2' src={logo} height={32} alt='CCC Logo' />
            <span className='d-inline-block text-truncate lh-sm'>
              Clinical Competency <br /> Calculator
            </span>
          </div>
          <div className='vr'></div>
          <button
            type='button'
            className='btn btn-link p-0 m-0 text-reset text-decoration-none text-end text-truncate lh-sm'
            data-bs-toggle='modal'
            data-bs-target='#username-modal'
          >
            You are <br /> <b>{username}</b>
          </button>
        </div>
      </div>
    </>
  );
}
