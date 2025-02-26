// import { MCQ } from '@/utils/types';
// import React from 'react';

// export default function Question({ question }: { question: MCQ | undefined }) {
//   return (
//     <>
//       {question ? (
//         <div className='text-start my-2'>
//           <div className='fs-4 mb-3'>{question.question}</div>
//           <div className='form-check'>
//             {Object.entries(question.options).map(([k, v], i) => (
//               <div key={k} className='form-check mb-2'>
//                 {/* <input className='form-check-input' type='checkbox' id={k} /> */}
//                 <label className='form-check-label' htmlFor={k}>
//                   {v}
//                 </label>
//               </div>
//             ))}
//           </div>
//           <div className='mt-3'>
//             <label htmlFor={`notes-${question.epa}-${question.kf}`} className='form-label'>
//               Additional Notes
//             </label>
//             <textarea className='form-control' id={`notes-${question.epa}-${question.kf}`} rows={3}></textarea>
//           </div>
//         </div>
//       ) : (
//         <div>Question not found</div>
//       )}
//     </>
//   );
// }
