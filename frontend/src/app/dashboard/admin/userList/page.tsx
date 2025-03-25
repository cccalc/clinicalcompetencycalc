'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const AdminDashboard = () => {
  interface User {
    id: string;
    user_id: string;
    email: string;
    role: string;
    display_name: string;
  }

  interface Role {
    role: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.rpc('fetch_users');
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data);
      }
    };

    const fetchRoles = async () => {
      const { data, error } = await supabase.from('roles').select('role');
      if (error) {
        console.error('Error fetching roles:', error);
      } else {
        setRoles(data.map((role: Role) => role.role));
      }
    };

    fetchUsers();
    fetchRoles();
  }, [router]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const updateUserRole = async () => {
    if (!selectedUser) return;

    console.log('Updating role for user:', selectedUser.user_id, 'to role:', selectedUser.role);

    const { error } = await supabase
      .from('user_roles') // Updating the correct table
      .update({ role: selectedUser.role })
      .eq('user_id', selectedUser.user_id); // Match by user_id

    if (error) {
      console.error('Error updating role:', error);
      return;
    }

    console.log('Role update successful!');

    // Fetch updated users after role update
    const { data, error: fetchError } = await supabase.rpc('fetch_users');
    if (fetchError) {
      console.error('Error fetching updated users:', fetchError);
    } else {
      setUsers(data);
    }

    setShowModal(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRole === '' || user.role === selectedRole)
  );

  return (
    <div className='container text-center'>
      <h1 className='my-4 text-primary fw-bold'>Manage Users</h1>

      {/* Search and Filter Bar */}
      <div className='mb-3 d-flex justify-content-between'>
        <input
          type='text'
          className='form-control me-2'
          placeholder='Search by name or email...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className='form-select w-25' value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value=''>All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <table className='table table-hover shadow rounded bg-white'>
        <thead className='table-dark'>
          <tr>
            <th>Display Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.user_id}>
              <td>{user.display_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button
                  className='btn btn-primary btn-sm me-2'
                  onClick={() => {
                    setSelectedUser(user);
                    setShowModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className='btn btn-danger btn-sm'
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedUser && (
        <div className='modal show' tabIndex={-1} style={{ display: 'block' }}>
          <div className='modal-dialog'>
            <div className='modal-content rounded shadow-lg'>
              <div className='modal-header bg-primary text-white'>
                <h5 className='modal-title'>Edit User Role</h5>
                <button type='button' className='btn-close' onClick={handleCloseModal}></button>
              </div>
              <div className='modal-body text-start'>
                <div className='p-3 border rounded mb-3'>
                  <p className='mb-2'>
                    <strong>ID:</strong> {selectedUser.user_id}
                  </p>
                  <p className='mb-2'>
                    <strong>Display Name:</strong> {selectedUser.display_name}
                  </p>
                  <p className='mb-2'>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                </div>
                <div className='p-3 border rounded'>
                  <label htmlFor='formRole' className='form-label fw-bold'>
                    Role
                  </label>
                  <select
                    id='formRole'
                    className='form-select shadow-sm'
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary' onClick={handleCloseModal}>
                  Close
                </button>
                <button type='button' className='btn btn-primary' onClick={updateUserRole}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedUser && (
        <div className='modal show' tabIndex={-1} style={{ display: 'block' }}>
          <div className='modal-dialog'>
            <div className='modal-content rounded shadow-lg'>
              <div className='modal-header bg-danger text-white'>
                <h5 className='modal-title'>Confirm Delete</h5>
                <button type='button' className='btn-close' onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className='modal-body text-center'>
                <p>
                  Are you sure you want to delete <strong>{selectedUser.display_name}</strong>?
                </p>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary' onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type='button' className='btn btn-danger'>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
