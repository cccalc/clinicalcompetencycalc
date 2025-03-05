import Header from '@/components/header';
import Link from 'next/link';

const RaterDashboard = () => {
  // Dummy data for student requests
  const requests = [
    { id: 1, student_id: 'student1', student_name: 'John Doe' },
    { id: 2, student_id: 'student2', student_name: 'Jane Smith' },
    { id: 3, student_id: 'student3', student_name: 'Alice Johnson' },
  ];

  return (
    <>
      <Header />
      <div className='container'>
        <h1>Rater Dashboard</h1>
        <ul className='list-group'>
          {requests.map((request) => (
            <li key={request.id} className='list-group-item'>
              <Link href={`/rate-student/${request.student_id}`}>{request.student_name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default RaterDashboard;
