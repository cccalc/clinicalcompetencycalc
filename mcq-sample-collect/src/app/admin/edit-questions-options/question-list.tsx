import type { MCQ } from '@/utils/types';

export default function QuestionList({ mcqs }: { mcqs: MCQ[] }) {
  return (
    <>
      <h3>Edit form questions and options</h3>
      {mcqs.map((mcq, i) => (
        <div key={i}>
          <div>
            {mcq.kf} {mcq.question}
          </div>
        </div>
      ))}
    </>
  );
}
