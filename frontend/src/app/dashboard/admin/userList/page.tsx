'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

/**
 * AdminDashboard Component
 *
 * A management panel for administrators to:
 * - View all users
 * - Search and filter users by name, email, or role
 * - Edit user roles
 * - Activate or deactivate users
 *
 * Data is pulled from Supabase using an RPC and direct table queries.
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

  /**
   * Represents a user's profile containing account status.
   */
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
  // State Management
  // ----------------------

  const [users, setUsers] = useState<(User & { account_status: string })[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUser, setSelectedUser] = useState<(User & { account_status: string }) | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches all users and joins them with account status from the `profiles` table.
   */
  const fetchUsers = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
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
        const profile = profiles.find((p: Profile) => p.id === user.user_id);
        return { ...user, account_status: profile?.account_status || 'Active' };
      });

      setUsers(usersWithStatus);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches all available roles from the `roles` table.
   */
  const fetchRoles = useCallback(async (): Promise<void> => {
    const { data, error } = await supabase.from('roles').select('role');
    if (error) {
      console.error('Error fetching roles:', error);
    } else {
      setRoles(data.map((r: Role) => r.role));
    }
  }, []);

  // ----------------------
  // Role Update Logic
  // ----------------------

  /**
   * Closes the Edit Role modal.
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  /**
   * Updates the user's role in the database and refreshes the list.
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

    fetchUsers();
    setShowModal(false);
  };

  // ----------------------
  // Status Toggle Logic
  // ----------------------

  /**
   * Toggles the user's account status between Active and Deactivated.
   */
  const toggleUserStatus = async () => {
    if (!selectedUser) return;

    const newStatus = selectedUser.account_status === 'Active' ? 'Deactivated' : 'Active';

    const { error } = await supabase
      .from('profiles')
      .update({ account_status: newStatus })
      .eq('id', selectedUser.user_id);

    if (error) {
      console.error(`Error changing status to ${newStatus}:`, error);
      alert(`Failed to ${newStatus.toLowerCase()} the user.`);
      return;
    }

    fetchUsers();
    setShowDeactivateModal(false);
  };

  // ----------------------
  // Filter & Sort Logic
  // ----------------------

  /**
   * Filters users based on search term and selected role,
   * and pushes deactivated users to the bottom.
   */
  const filteredUsers = users
    .filter(
      (user) =>
        (user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedRole === '' || user.role === selectedRole)
    )
    .sort((a, b) => {
      if (a.account_status === 'Deactivated' && b.account_status !== 'Deactivated') return 1;
      if (a.account_status !== 'Deactivated' && b.account_status === 'Deactivated') return -1;
      return 0;
    });

  const fetchAll = useCallback(async (): Promise<void> => {
    await fetchUsers();
    await fetchRoles();
  }, [fetchUsers, fetchRoles]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ----------------------
  // Render UI
  // ----------------------

  return (
    <div className='container text-center'>
      <h1 className='my-4 text-primary fw-bold'>Manage Users</h1>

      {/* Search & Filter */}
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

      {/* Loading Spinner */}
      {loading ? (
        <div className='my-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      ) : (
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
              <tr
                key={user.user_id}
                className={`align-middle ${user.account_status === 'Deactivated' ? 'table-secondary text-muted' : ''}`}
              >
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
                    disabled={user.account_status === 'Deactivated'}
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
      )}

      {/* Edit Role Modal */}
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

      {/* Deactivate/Activate Confirmation Modal */}
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
                <p>
                  Are you sure you want to{' '}
                  <strong>{selectedUser.account_status === 'Active' ? 'deactivate' : 'activate'}</strong> this user?
                </p>
                <div className='p-3 border rounded'>
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
