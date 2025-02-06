import {MCQ} from '@/data/types';
import React from 'react';

export default function Question({question}: {question: MCQ | undefined}) {
  return (
    <>
      {question ? (
        <div className='text-start'>
          <div className='h3'>{question!.question}</div>
          <div className='form-check'>
            {Object.entries(question.options).map(([k, v]) => (
              <>
                <input className='form-check-input' type='checkbox' id={k} />
                <label className='form-check-label' htmlFor={k}>
                  {v}
                </label>
              </>
            ))}
          </div>
        </div>
      ) : (
        <div>Question not found</div>
      )}
    </>
  );
}
