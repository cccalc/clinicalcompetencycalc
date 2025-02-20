import type { MCQ } from '@/utils/types';

export default function QuestionList({ mcqs }: { mcqs: MCQ[] }) {
  return (
    <>
      <h3 className='mb-3'>Edit form questions and options</h3>
      <div className='accordion' id='question-list'>
        {mcqs.map((mcq, i) => (
          <div className='accordion-item' key={i}>
            <h4 className='accordion-header' id={`heading-${i}`}>
              <button
                className='accordion-button collapsed'
                type='button'
                data-bs-toggle='collapse'
                data-bs-target={`#collapse-${i}`}
                aria-expanded='false'
                aria-controls={`collapse-${i}`}
              >
                <span>
                  <span className='badge text-bg-primary'>{mcq.kf}</span> {mcq.question}
                </span>
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
                  <li className='list-group-item d-flex justify-content-between align-items-start' key={key}>
                    <div>{value}</div>
                    <div>
                      <i className='bi bi-pencil'></i>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
