'use client';

import { useEffect, useState } from 'react';

import Loading from '@/components/loading';
import { getHistoricalMCQs } from '@/utils/get-epa-data';
import type { Tables } from '@/utils/supabase/database.types';
import type { MCQ } from '@/utils/types';

import EditOptionModal from './edit-option-modal';
import EditQuestionModal from './edit-question-modal';
import QuestionItem from './question-list-item';

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

  const handleOptionClick = (mcq: MCQ, key: string, text: string) => {
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
            <QuestionItem key={i} i={i} mcq={mcq} handleOptionClick={handleOptionClick} />
          ))}
        </div>
      )}

      <EditOptionModal
        mcqInformation={{ get: mcqInformation, set: setMCQInformation }}
        optionMCQ={{ get: optionMCQ, set: setOptionMCQ }}
        optionKey={{ get: optionKey, set: setOptionKey }}
        optionText={{ get: optionText, set: setOptionText }}
        newOptionText={{ get: newOptionText, set: setNewOptionText }}
      />
      <EditQuestionModal
        mcqInformation={{ get: mcqInformation, set: setMCQInformation }}
        optionMCQ={{ get: optionMCQ, set: setOptionMCQ }}
        optionKey={{ get: optionKey, set: setOptionKey }}
        optionText={{ get: optionText, set: setOptionText }}
        newOptionText={{ get: newOptionText, set: setNewOptionText }}
      />
    </>
  );
}
