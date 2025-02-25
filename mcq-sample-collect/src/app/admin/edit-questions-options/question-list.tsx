'use client';

import { useEffect, useState } from 'react';

import Loading from '@/components/loading';
import { getHistoricalMCQs } from '@/utils/get-epa-data';
import type { Tables } from '@/utils/supabase/database.types';
import type { MCQ } from '@/utils/types';

import EditModal from './edit-modal';
import { renderOption, renderQuestion } from './render-spans';

export default function QuestionList() {
  const [mcqInformation, setMCQInformation] = useState<Tables<'mcqs_options'>[] | null>(null);

  const [optionMCQ, setOptionMCQ] = useState<MCQ | null>(null);
  const [optionKey, setOptionKey] = useState<string | null>(null);
  const [optionText, setOptionText] = useState<string | null>(null);
  const [newOptionText, setNewOptionText] = useState<string | null>(null);

  useEffect(() => {
    const fetchMCQs = async () => setMCQInformation((await getHistoricalMCQs()) ?? null);
    fetchMCQs();
  }, []);

  const handleClick = (mcq: MCQ, key: string, text: string) => {
    setOptionMCQ(mcq);
    setOptionKey(key);
    setOptionText(text);
    setNewOptionText(text);
    document.querySelectorAll('input[id="new-option"]').forEach((el) => {
      (el as HTMLInputElement).value = text;
    });
  };

  return (
    <>
      <h3 className='mb-3'>Edit form questions and options</h3>
      {!mcqInformation || !mcqInformation.length || !mcqInformation![0].data ? (
        <Loading />
      ) : (
        <div className='accordion' id='question-list'>
          {(mcqInformation[0].data as MCQ[]).map((mcq, i) => (
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
        mcqInformation={mcqInformation}
        setMCQInformation={setMCQInformation}
        optionMCQ={optionMCQ}
        optionKey={optionKey}
        setOptionKey={setOptionKey}
        optionText={optionText}
        newOptionText={newOptionText}
        setNewOptionText={setNewOptionText}
      />
    </>
  );
}
