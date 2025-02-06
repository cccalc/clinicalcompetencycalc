'use client';

import {FormDataYAML, MCQ} from '@/data/types';
import {useEffect, useMemo, useState} from 'react';

import Footer from './footer';
import Header from './header';
import Loading from '@/components/loading';
import Question from './question';
import {getRandomItem} from '@/data/util';

export default function Body({formData}: {formData: FormDataYAML | undefined}) {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<MCQ | undefined>(undefined);

  useEffect(() => {
    if (formData?.mcq) {
      setQuestion(getRandomItem(formData.mcq));
      setLoading(false);
    }
  }, [formData]);

  const header = useMemo(
    () =>
      question ? (
        <>
          <div className='fw-bold'>
            EPA {question.epa}: {formData?.epa_desc[question.epa]}
          </div>
          <div>
            Key Feature {question.kf}: {formData?.kf_desc[question.kf]}
          </div>
        </>
      ) : (
        <></>
      ),
    [question],
  );

  return (
    <div className='d-flex flex-column min-vh-100'>
      <div className='row'>
        <Header header={header} />
      </div>
      <div className='row flex-grow-1 d-flex align-items-center'>
        <div className='container w-75 p-5 text-center'>{loading ? <Loading /> : <Question question={question} />}</div>
      </div>
      <div className='row'>
        <Footer />
      </div>
    </div>
  );
}
