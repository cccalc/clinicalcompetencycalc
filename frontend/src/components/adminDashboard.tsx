'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createClient } from '@/utils/supabase/client';

// import { isAdmin } from '@/utils/supabase/roles';

const supabase = createClient();

const AdminDashboard = () => {
  // TODO: Use supabase CLI to autogenerate types
  interface User {
    id: number;
    user_id: string;
    email: string;
    role: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  // const [authorized, setAuthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();

    // const checkAdmin = async () => {
    //   const { data, error } = await supabase.auth.getUser();
    //   if (error) {
    //     console.error('Error fetching user:', error);
    //     router.push('/login');
    //     return;
    //   }
    //   if (!data?.user) {
    //     router.push('/login');
    //     return;
    //   }

    //   const isAdminUser = await isAdmin(data.user.id);
    //   if (!isAdminUser) {
    //     router.push('/dashboard');
    //   } else {
    //     fetchUsers();
    //   }
    // };

    // checkAdmin();
  }, [router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className='container'>
      <h1 className='my-4'>Admin Dashboard</h1>
      <input
        type='text'
        className='form-control mb-4'
        placeholder='Search users...'
        value={searchTerm}
        onChange={handleSearch}
      />
      <table className='table table-striped'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* {filteredUsers.map((user) => ( */}
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.user_id}</td>
              <td>{user.role}</td>
              <td>
                <button className='btn btn-primary btn-sm'>Edit</button>
                <button className='btn btn-danger btn-sm'>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
