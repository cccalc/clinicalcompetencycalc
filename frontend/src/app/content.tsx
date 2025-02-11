'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {FormDataYAML, MCQ} from '@/data/types';
import Loading from '@/components/loading';
import Question from './question';

export default function Content({formData}: {formData: FormDataYAML | undefined}) {
  const [loading, setLoading] = useState(true);
  const [currentEPA, setCurrentEPA] = useState<string | undefined>(undefined);
  const [choices, setChoices] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (formData) {
      setLoading(false);
      setCurrentEPA(formData.mcq[0].epa);
    }
  }, [formData]);

  const questionsForCurrentEPA = useMemo(() => {
    return formData?.mcq.filter((q) => q.epa === currentEPA);
  }, [formData, currentEPA]);

  const header = useMemo(() => {
    if (questionsForCurrentEPA && questionsForCurrentEPA.length > 0) {
      const question = questionsForCurrentEPA[0];
      return (
        <div className='mb-4'>
          <div className='h2 p-3'>
            EPA {question.epa}: {formData?.epa_desc[question.epa]}
          </div>
          <div>
            Key Function {question.kf}: {formData?.kf_desc[question.kf]}
          </div>
        </div>
      );
    }
    return <></>;
  }, [questionsForCurrentEPA, formData]);

  const handleNextEPA = () => {
    const currentIndex = formData?.mcq.findIndex((q) => q.epa === currentEPA);
    if (currentIndex !== undefined && currentIndex >= 0 && formData) {
      let nextEPAIndex = (currentIndex + 1) % formData.mcq.length;
      let nextEPA = formData.mcq[nextEPAIndex].epa;
      while (nextEPA === currentEPA && nextEPAIndex !== currentIndex) {
        nextEPAIndex = (nextEPAIndex + 1) % formData.mcq.length;
        nextEPA = formData.mcq[nextEPAIndex].epa;
      }
      setCurrentEPA(nextEPA);
      window.scrollTo({top: 0, behavior: 'smooth'}); // Scroll to the top of the page
    }
  };

  const handlePreviousEPA = () => {
    const currentIndex = formData?.mcq.findIndex((q) => q.epa === currentEPA);
    if (currentIndex !== undefined && currentIndex >= 0 && formData) {
      let previousEPAIndex = (currentIndex - 1 + formData.mcq.length) % formData.mcq.length;
      let previousEPA = formData.mcq[previousEPAIndex].epa;
      while (previousEPA === currentEPA && previousEPAIndex !== currentIndex) {
        previousEPAIndex = (previousEPAIndex - 1 + formData.mcq.length) % formData.mcq.length;
        previousEPA = formData.mcq[previousEPAIndex].epa;
      }
      console.log(`Current EPA: ${currentEPA}, Previous EPA: ${previousEPA}`);
      setCurrentEPA(previousEPA);
      window.scrollTo({top: 0, behavior: 'smooth'}); // Scroll to the top of the page
    }
  };

  return (
    <div className='d-flex flex-column min-vh-100'>
      <div className='row flex-grow-1'>
        <div className='container px-5 pt-3 text-center' style={{maxWidth: '720px'}}>
          {loading ? (
            <Loading />
          ) : (
            <>
              {header}
              {questionsForCurrentEPA?.map((question, index) => (
                <div key={index} className='mb-5'>
                  <Question question={question} choices={choices} />
                </div>
              ))}
              <div className='d-flex justify-content-between mt-4 mb-5'>
                <button onClick={handlePreviousEPA} className='btn btn-secondary'>
                  Previous EPA
                </button>
                <button onClick={handleNextEPA} className='btn btn-primary'>
                  Next EPA
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
