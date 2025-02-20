'use server';

import Header from '@/components/header';
import Loading from '@/components/loading';
import { getHistoricalMCQs } from '@/utils/get-epa-data';

import QuestionList from './question-list';

export default async function Account() {
  const mcqs = await getHistoricalMCQs();

  return (
    <div className='d-flex flex-column min-vh-100'>
      <div className='row sticky-top'>
        <Header />
      </div>
      <div className='container p-5' style={{ maxWidth: '720px' }}>
        {mcqs ? <QuestionList mcqs={mcqs} /> : <Loading />}
      </div>
    </div>
  );
}
