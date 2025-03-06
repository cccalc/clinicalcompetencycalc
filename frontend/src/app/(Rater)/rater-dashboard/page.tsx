import Header from '@/components/header';

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
          {requests.map((requests) => (
            <li key={requests.id} className='list-group-item'>
              <h3>
                {requests.student_id} || {requests.student_name}
              </h3>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default RaterDashboard;
