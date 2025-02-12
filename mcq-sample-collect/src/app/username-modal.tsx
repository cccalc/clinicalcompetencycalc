'use client';

import {Dispatch, SetStateAction, useState} from 'react';

export default function UsernameModal({username}: {username: {set: Dispatch<SetStateAction<string>>; val: string}}) {
  const [tempUsername, setTempUsername] = useState<string>('');

  const handleSave = () => {
    username.set(tempUsername);
    setTempUsername('');
    (document.getElementById('new-username-input')! as HTMLInputElement).value = '';
  };

  return (
    <div
      className='modal fade'
      id='username-modal'
      tabIndex={-1}
      aria-labelledby='username-modal-label'
      aria-hidden='true'
    >
      <div className='modal-dialog modal-dialog-centered'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h1 className='modal-title fs-5' id='username-modal-label'>
              Change session user name
            </h1>
            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
          </div>
          <div className='modal-body'>
            <p>
              You are currently submitting sample tags as <b>{username.val}</b>.
            </p>
            <p>To change the name, please enter a new name below.</p>
            <div>
              <input
                type='text'
                id='new-username-input'
                className='form-control'
                placeholder='New username'
                onChange={(e) => setTempUsername(e.target.value)}
              />
            </div>
          </div>
          <div className='modal-footer'>
            <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>
              Close
            </button>
            <button
              type='button'
              className='btn btn-primary'
              data-bs-dismiss='modal'
              onClick={handleSave}
              disabled={tempUsername.length === 0 || tempUsername === username.val}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
