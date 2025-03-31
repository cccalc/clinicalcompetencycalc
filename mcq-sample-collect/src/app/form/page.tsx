'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Header from '@/components/header';
import Loading from '@/components/loading';
import { getEPAKFDescs, getLatestMCQs } from '@/utils/get-epa-data';
import { DevLevel, MCQ, type EPAKFDesc } from '@/utils/types';
import { getDevLevelInt, getRandomItem } from '@/utils/util';

import EpaKfDesc from './epa-kf-desc';
import Question from './question';
import SubmitButtons from './submit-buttons';
import { submitSample } from './actions';
import { supabase_authorize } from '@/utils/async-util';

export default function Form() {
  const [authorized, setAuthorized] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [descData, setDescData] = useState<EPAKFDesc | undefined>(undefined);
  const [mcqData, setMCQData] = useState<MCQ[] | undefined>(undefined);

  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [choices, setChoices] = useState<{ [key: string]: boolean }>({});
  const [devLevel, setDevLevel] = useState<DevLevel>('none');

  useEffect(() => {
    supabase_authorize(['mcqs_options.select']).then((result) => setAuthorized(result));
    getEPAKFDescs().then((data) => setDescData(data));
    getLatestMCQs().then((data) => setMCQData(data));
  }, []);

  const randomizeQuestionChoices = (options: { [key: string]: string }): { [key: string]: boolean } => {
    const keys = Object.keys(options);
    const length = keys.length;
    let choices = {};

    // If options is empty, return an empty object
    if (length === 0) return {};

    // Randomly select choices from options
    // Ensure at least one choice and <= 50% of the options are selected
    // Accept when selected == 50% for case of 2 options
    let selectedCount = 0;
    while (selectedCount === 0 || selectedCount / length > 0.5) {
      choices = keys.reduce((o, k) => ({ ...o, [k]: Math.random() < 0.5 }), {});
      selectedCount = Object.values(choices).filter((v) => v).length;
    }

    return choices;
  };

  const getNewQuestions = useCallback(() => {
    setLoading(true);
    if (mcqData && descData) {
      const kf = getRandomItem(Object.keys(descData.kf_desc));
      const qs = mcqData.filter((q) => q.kf === kf);
      setQuestions(qs);
      if (qs.length > 0)
        setChoices(qs.map((q) => randomizeQuestionChoices(q.options)).reduce((a, o) => Object.assign(a, o), {}));
    }
    setLoading(false);
  }, [descData, mcqData]);

  useEffect(() => {
    getNewQuestions();
  }, [getNewQuestions]);

  const desc = useMemo(() => {
    return {
      epa: questions[0] ? questions[0].epa : '',
      kf: questions[0] ? questions[0].kf : '',
      epa_desc: descData?.epa_desc[questions[0] ? questions[0].epa : 0] ?? '',
      kf_desc: descData?.kf_desc[questions[0] ? questions[0].kf : 0] ?? '',
    };
  }, [descData, questions]);

  const handleSumbit = async () => {
    if (!questions) return;
    if (Object.keys(choices).length === 0) return;

    const tableName = 'mcq_kf' + questions[0].kf.replace(/\./g, '_');

    const row = {
      ...Object.keys(choices).reduce((o, k) => ({ ...o, ['c' + k.replace(/\./g, '_')]: choices[k] }), {}),
      dev_level: getDevLevelInt(devLevel),
    };

    const success = submitSample(tableName, row);
    if (await success) getNewQuestions();
  };

  const body = () => {
    if (loading || questions.length === 0) return <Loading />;
    if (!authorized)
      return (
        <div>
          You are not authorized to perform this action. If you believe you should have authorization, please contact
          your administrator.
        </div>
      );
    return questions.map((q, i) => <Question key={i} question={q} choices={choices} />);
  };

  return (
    <>
      <div className='d-flex flex-column min-vh-100'>
        <div className='row sticky-top'>
          <Header />
          {loading || <EpaKfDesc desc={desc} />}
        </div>
        <div className='row flex-grow-1'>
          <div className='container px-5 pt-3 text-center' style={{ maxWidth: '720px' }}>
            {body()}
          </div>
        </div>
        <div className='row sticky-bottom'>
          {loading || (
            <SubmitButtons
              skip={getNewQuestions}
              submit={handleSumbit}
              devLevel={{ set: setDevLevel, val: devLevel }}
            />
          )}
        </div>
      </div>
    </>
  );
}
