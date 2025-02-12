import {Dispatch, SetStateAction} from 'react';

import Image from 'next/image';

export default function Header({username}: {username: {set: Dispatch<SetStateAction<string>>; val: string}}) {
  const WIDTH = 50;
  const HEIGHT = WIDTH * (16 / 21);

  return (
    <>
      <div className='bg-secondary text-white p-3'>
        <div className='container-flex mx-3 d-flex gap-2 justify-content-between align-items-center'>
          <div className='d-flex align-items-center' style={{minWidth: '0'}}>
            <Image className='me-2' src='/dark-bw.svg' width={WIDTH} height={HEIGHT} alt='CCC Logo' />
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
            You are <br /> <b>{username.val}</b>
          </button>
        </div>
      </div>
    </>
  );
}
