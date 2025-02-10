'use client';

import {FormDataYAML, MCQ} from '@/data/types';
import {getRandomChoicesFromOptions, getRandomItem} from '@/data/util';
import {useEffect, useMemo, useState} from 'react';

import Footer from './footer';
import Header from './header';
import Loading from '@/components/loading';
import Question from './question';

export type DevLevel = 'none' | 'rem' | 'edv' | 'dev' | 'ent';

export default function Content({formData}: {formData: FormDataYAML | undefined}) {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<MCQ | undefined>(undefined);
  const [choices, setChoices] = useState<{[key: string]: boolean}>({});
  const [devLevel, setDevLevel] = useState<DevLevel>('none');

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

  const header = useMemo(() => {
    if (question)
      return (
        <>
          <div className='fw-bold pb-2'>
            EPA {question.epa}: {formData?.epa_desc[question.epa]}
          </div>
          <div>
            Key Function {question.kf}: {formData?.kf_desc[question.kf]}
          </div>
        </>
      );
    return <></>;
  }, [question]);

  return (
    <div className='d-flex flex-column min-vh-100'>
      <div className='row sticky-top'>
        {loading ? <></> : <Header header={header} epa={question?.epa} kf={question?.kf} />}
      </div>
      <div className='row flex-grow-1'>
        <div className='container px-5 pt-3 text-center' style={{maxWidth: '720px'}}>
          {loading ? <Loading /> : <Question question={question} choices={choices} />}
        </div>
      </div>
      <div className='row sticky-bottom'>
        {loading ? <></> : <Footer skip={getNewQuestion} devLevel={{set: setDevLevel, val: devLevel}} />}
      </div>
    </div>
  );
}
