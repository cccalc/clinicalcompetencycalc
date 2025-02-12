'use client';

import {FormDataYAML, MCQ} from '@/data/types';
import {getRandomChoicesFromOptions, getRandomItem} from '@/data/util';
import {useEffect, useMemo, useState} from 'react';

import EpaKfDesc from './epa-kf-desc';
import Header from '../components/header';
import Loading from '@/components/loading';
import Question from './question';
import SubmitButtons from './submit-buttons';
import UsernameModal from './username-modal';

export type DevLevel = 'none' | 'rem' | 'edv' | 'dev' | 'ent';

export default function Content({formData}: {formData: FormDataYAML | undefined}) {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<MCQ | undefined>(undefined);
  const [choices, setChoices] = useState<{[key: string]: boolean}>({});
  const [devLevel, setDevLevel] = useState<DevLevel>('none');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    getNewQuestion();
  }, [formData]);

  const getNewQuestion = () => {
    setLoading(true);
    if (formData?.mcq) {
      const question = getRandomItem(formData.mcq);
      setQuestion(question);
      question && setChoices(getRandomChoicesFromOptions(question.options));
      setLoading(false);
    }
  };

  const desc = useMemo(() => {
    return {
      epa: question?.epa,
      kf: question?.kf,
      epa_desc: formData?.epa_desc[question?.epa ?? 0],
      kf_desc: formData?.kf_desc[question?.kf ?? 0],
    };
  }, [question]);

  return (
    <>
      <div className='d-flex flex-column min-vh-100'>
        <div className='row sticky-top'>
          <Header username={{set: setUsername, val: username}} />
          {loading || <EpaKfDesc desc={desc} />}
        </div>
        <div className='row flex-grow-1'>
          <div className='container px-5 pt-3 text-center' style={{maxWidth: '720px'}}>
            {loading ? <Loading /> : <Question question={question} choices={choices} />}
          </div>
        </div>
        <div className='row sticky-bottom'>
          {loading || <SubmitButtons skip={getNewQuestion} devLevel={{set: setDevLevel, val: devLevel}} />}
        </div>
      </div>
      <UsernameModal username={{set: setUsername, val: username}} />
    </>
  );
}
