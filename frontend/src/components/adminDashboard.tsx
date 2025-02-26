'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { isAdmin } from '@/utils/supabase/roles';
import { useRouter } from 'next/navigation';

const supabase = createClient();

const AdminDashboard = () => {
  interface User {
    id: string;
    email: string;
    role: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data);
      }
    };

    const checkAdmin = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
        return;
      }
      if (!data?.user) {
        router.push('/login');
        return;
      }

      const isAdminUser = await isAdmin(data.user.id);
      if (!isAdminUser) {
        router.push('/dashboard');
      } else {
        fetchUsers();
      }
    };

    checkAdmin();
  }, [router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()));

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
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
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
