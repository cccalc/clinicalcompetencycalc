'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

/**
 * AdminDashboard Component
 *
 * Provides a user interface for administrators to manage users:
 * - View all users
 * - Search/filter users by name/email/role
 * - Edit user roles
 *
 * Data is fetched from Supabase using an RPC function and table queries.
 */
const AdminDashboard = () => {
  // ----------------------
  // Types
  // ----------------------

  /**
   * Represents a user fetched from Supabase.
   */
  interface User {
    id: string;
    user_id: string;
    email: string;
    role: string;
    display_name: string;
  }

  interface Profile {
    id: string;
    account_status: string;
  }

  /**
   * Represents a role object from the `roles` table.
   */
  interface Role {
    role: string;
  }

  // ----------------------
  // State
  // ----------------------

  const [users, setUsers] = useState<(User & { account_status: string })[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUser, setSelectedUser] = useState<(User & { account_status: string }) | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);


  // ----------------------
  // Data Fetching
  // ----------------------

  useEffect(() => {
    /**
     * Fetch all users from the database using a stored procedure.
     */
    fetchUsers();
    fetchRoles();
  });

  const fetchUsers = async () => {
    try {
      const { data: users, error: usersError } = await supabase.rpc('fetch_users');
      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, account_status');

      if (profilesError) {
        console.error('Error fetching account statuses:', profilesError);
        return;
      }

      const usersWithStatus = users.map((user: User) => {
        const profile = profiles.find((profile: Profile) => profile.id === user.user_id);
        return {
          ...user,
          account_status: profile ? profile.account_status : 'Active',
        };
      });

      setUsers(usersWithStatus);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

    /**
     * Fetch list of available roles from the `roles` table.
     */
  const fetchRoles = async () => {
    const { data, error } = await supabase.from('roles').select('role');
    if (error) {
      console.error('Error fetching roles:', error);
    } else {
      setRoles(data.map((role: Role) => role.role));
    }
  };

  // ----------------------
  // Role Update Logic
  // ----------------------

  /**
   * Handles closing the Edit Role modal.
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  /**
   * Submits the updated user role to the database.
   * Re-fetches user list after update for consistency.
   */
  const updateUserRole = async () => {
    if (!selectedUser) return;

    const { error } = await supabase
      .from('user_roles')
      .update({ role: selectedUser.role })
      .eq('user_id', selectedUser.user_id);

    if (error) {
      console.error('Error updating role:', error);
      return;
    }

    console.log('Role update successful!');
    fetchUsers();
    setShowModal(false);
  };

  // ----------------------
  // Filtering Logic
  // ----------------------

  /**
   * Filters users based on search term and selected role.
   */
  const filteredUsers = users.filter(
    (user) =>
      (user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRole === '' || user.role === selectedRole)
  );

  // ----------------------
  // Render
  // ----------------------

  return (
    <div className='container text-center'>
      <h1 className='my-4 text-primary fw-bold'>Manage Users</h1>

      {/* Search and Role Filter */}
      <div className='mb-3 d-flex justify-content-between'>
        <input
          type='text'
          className='form-control me-2'
          placeholder='Search by name or email...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className='form-select w-25'
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value=''>All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* User Table */}
      <table className='table table-hover shadow rounded bg-white'>
        <thead className='table-dark'>
          <tr>
            <th>Display Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.user_id} className={user.account_status === 'Deactivated' ? 'deactivated' : ''}>
              <td>{user.display_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.account_status}</td>
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
                    setShowDeactivateModal(true);
                  }}
                >
                  {user.account_status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
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
                  <p>
                    <strong>ID:</strong> {selectedUser.user_id}
                  </p>
                  <p>
                    <strong>Display Name:</strong> {selectedUser.display_name}
                  </p>
                  <p>
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

      {/* Delete Modal (Logic not yet implemented) */}
      {showDeactivateModal && selectedUser && (
        <div className='modal show' tabIndex={-1} style={{ display: 'block' }}>
          <div className='modal-dialog'>
            <div className='modal-content rounded shadow-lg'>
              <div className='modal-header bg-danger text-white'>
                <h5 className='modal-title'>
                  Confirm {selectedUser.account_status === 'Active' ? 'Deactivation' : 'Activation'}
                </h5>
                <button type='button' className='btn-close' onClick={() => setShowDeactivateModal(false)}></button>
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
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary' onClick={() => setShowDeactivateModal(false)}>
                  Close
                </button>
                <button type='button' className='btn btn-danger' onClick={toggleUserStatus}>
                  {selectedUser.account_status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeactivateModal && selectedUser && (
        <div className='modal show' tabIndex={-1} style={{ display: 'block' }}>
          <div className='modal-dialog'>
            <div className='modal-content rounded shadow-lg'>
              <div className='modal-header bg-danger text-white'>
                <h5 className='modal-title'>Confirm Delete</h5>
                <button type='button' className='btn-close' onClick={() => setShowDeactivateModal(false)}></button>
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
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary' onClick={() => setShowDeactivateModal(false)}>
                  Cancel
                </button>
                <button type='button' className='btn btn-danger' onClick={toggleUserStatus}>
                  {selectedUser.account_status === 'Active' ? 'Deactivate' : 'Activate'}
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
