'use client';

import { useState } from 'react';

import Loading from '@/components/loading';
import type { Tables } from '@/utils/supabase/database.types';
import type { MCQ } from '@/utils/types';

import EditModal from './edit-modal';
import { renderOption, renderQuestion } from './render-spans';

export default function QuestionList({ mcqs }: { mcqs: Tables<'mcqs_options'>[] }) {
  const [optMCQ, setOptMCQ] = useState<MCQ | null>(null);
  const [optKey, setOptKey] = useState<string | null>(null);
  const [optText, setOptText] = useState<string | null>(null);

  const [newOptText, setNewOptText] = useState<string | null>(null);

  const handleClick = (oMCQ: MCQ, oKey: string, oText: string) => {
    setOptMCQ(oMCQ);
    setOptKey(oKey);
    setOptText(oText);
    setNewOptText(oText);
    document.querySelectorAll('input[id="new-option"]').forEach((el) => {
      (el as HTMLInputElement).value = oText;
    });
  };

  return (
    <>
      <h3 className='mb-3'>Edit form questions and options</h3>
      {!mcqs || !mcqs.length || !mcqs![0].data ? (
        <Loading />
      ) : (
        <div className='accordion' id='question-list'>
          {(mcqs[0].data as MCQ[]).map((mcq, i) => (
            <div className='accordion-item' key={i}>
              <h4 className='accordion-header' id={`heading-${i}`}>
                <button
                  className='accordion-button collapsed gap-1'
                  type='button'
                  data-bs-toggle='collapse'
                  data-bs-target={`#collapse-${i}`}
                  aria-expanded='false'
                  aria-controls={`collapse-${i}`}
                >
                  {renderQuestion(mcq.kf, mcq.question)}
                </button>
              </h4>
              <div
                id={`collapse-${i}`}
                className='accordion-collapse collapse bg-body-secondary'
                aria-labelledby={`heading-${i}`}
                data-bs-parent='#question-list'
              >
                <ul className='list-group p-2'>
                  {Object.entries(mcq.options).map(([key, value]) => (
                    <li className='list-group-item pe-2 d-flex justify-content-between align-items-center' key={key}>
                      {renderOption(key, value)}
                      <button
                        className='btn'
                        data-bs-toggle='modal'
                        data-bs-target='#edit-modal'
                        onClick={() => handleClick(mcq, key, value)}
                      >
                        <i className='bi bi-pencil'></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditModal
        optMCQ={optMCQ}
        optKey={optKey}
        optText={optText}
        newOptText={newOptText}
        setNewOptText={setNewOptText}
      />
    </>
  );
}
