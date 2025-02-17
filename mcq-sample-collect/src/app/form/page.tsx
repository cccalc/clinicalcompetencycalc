'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Header from '@/components/header';
import Loading from '@/components/loading';
import { getFormData } from '@/utils/get-epa-data';
import { DevLevel, EPADataYAML, MCQ } from '@/utils/types';
import { getRandomChoicesFromOptions, getRandomItem } from '@/utils/util';

import EpaKfDesc from './epa-kf-desc';
import Question from './question';
import SubmitButtons from './submit-buttons';

export default function Form() {
  const [loading, setLoading] = useState<boolean>(true);
  const [question, setQuestion] = useState<MCQ | undefined>(undefined);
  const [choices, setChoices] = useState<{ [key: string]: boolean }>({});
  const [devLevel, setDevLevel] = useState<DevLevel>('none');
  const [formData, setFormData] = useState<EPADataYAML | undefined>(undefined);

  useEffect(() => {
    getFormData()
      .then((data) => setFormData(data))
      .catch((err) => console.error(err));
  }, []);

  const getNewQuestion = useCallback(() => {
    setLoading(true);
    if (formData?.mcq) {
      const question = getRandomItem(formData.mcq);
      setQuestion(question);
      if (question) setChoices(getRandomChoicesFromOptions(question.options));
      setLoading(false);
    }
  }, [formData]);

  useEffect(() => {
    getNewQuestion();
  }, [formData, getNewQuestion]);

  const desc = useMemo(() => {
    return {
      epa: question?.epa,
      kf: question?.kf,
      epa_desc: formData?.epa_desc[question?.epa ?? 0],
      kf_desc: formData?.kf_desc[question?.kf ?? 0],
    };
  }, [formData, question]);

  return (
    <>
      <div className='d-flex flex-column min-vh-100'>
        <div className='row sticky-top'>
          <Header />
          {loading || <EpaKfDesc desc={desc} />}
        </div>
        <div className='row flex-grow-1'>
          <div className='container px-5 pt-3 text-center' style={{ maxWidth: '720px' }}>
            {loading || !formData ? <Loading /> : <Question question={question} choices={choices} />}
          </div>
        </div>
        <div className='row sticky-bottom'>
          {loading || <SubmitButtons skip={getNewQuestion} devLevel={{ set: setDevLevel, val: devLevel }} />}
        </div>
      </div>
      {/* <UsernameModal username={username} /> */}
    </>
  );
}
