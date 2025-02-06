import React from 'react';

export default function Footer() {
  const buttons: {text: string; color: string}[] = [
    {text: 'Remedial', color: 'danger'},
    {text: 'Early developing', color: 'warning'},
    {text: 'Developing', color: 'info'},
    {text: 'Entrustable', color: 'success'},
  ];

  return (
    <div className='bg-light text-center'>
      <div className='container p-3'>
        <div className='row'>
          <div className='btn-toolbar' role='toolbar' aria-label='Toolbar with button groups'>
            <div className='btn-group me-2 flex-grow-1' role='group' aria-label='Development level'>
              {buttons.map((btn) => (
                <React.Fragment key={btn.text}>
                  <input
                    type='radio'
                    className='btn-check'
                    name='development-level'
                    id={`development-level-${btn.text}`}
                    autoComplete='off'
                  ></input>
                  <label className={`btn btn-outline-${btn.color} fw-bold`} htmlFor={`development-level-${btn.text}`}>
                    {btn.text}
                  </label>
                </React.Fragment>
              ))}
            </div>
            <div className='btn-group' role='group' aria-label='Clear selection'>
              <button type='button' className='btn btn-outline-secondary'>
                <i className='bi bi-x-lg'></i>
              </button>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <div className='d-grid'>
              <button type='button' className='btn btn-secondary mt-3'>
                Skip
              </button>
            </div>
          </div>
          <div className='col'>
            <div className='d-grid'>
              <button type='button' className='btn btn-primary mt-3'>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
