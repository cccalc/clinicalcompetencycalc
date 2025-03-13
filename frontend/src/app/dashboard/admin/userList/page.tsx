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

  interface Permission {
    permission: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.rpc('fetch_users');

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(
          data.map((user: User) => ({
            id: user.id,
            user_id: user.user_id,
            email: user.email || '',
            role: user.role,
            display_name: user.display_name || '',
          }))
        );
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

    const fetchPermissions = async () => {
      const { data, error } = await supabase.from('permissions').select('permission');
      if (error) {
        console.error('Error fetching permissions:', error);
      } else {
        setPermissions(data.map((permission: Permission) => permission.permission));
      }
    };

    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, [router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleEdit = async (user: User) => {
    setSelectedUser(user);
    setShowModal(true);

    const { data: rolePermissions, error: rolePermissionsError } = await supabase.rpc('fetch_role_permissions', {
      role: user.role,
    });
    if (rolePermissionsError) {
      console.error('Error fetching role permissions:', rolePermissionsError);
    } else {
      setCurrentPermissions(rolePermissions.map((permission: Permission) => permission.permission));
      setAvailablePermissions(
        permissions.filter((permission) => !rolePermissions.map((p: Permission) => p.permission).includes(permission))
      );
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setCurrentPermissions([]);
    setAvailablePermissions([]);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRole === '' || user.role === selectedRole)
  );

  return (
    <div className='container'>
      <h1 className='my-4'>Admin Dashboard</h1>
      <div className='mb-4'>
        <input
          type='text'
          className='form-control mb-2'
          placeholder='Search users...'
          value={searchTerm}
          onChange={handleSearch}
        />
        <select className='form-select' value={selectedRole} onChange={handleRoleFilter}>
          <option value=''>All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
      <table className='table table-striped'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Display Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.user_id}>
              <td>{user.user_id}</td>
              <td>{user.display_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button className='btn btn-primary btn-sm' onClick={() => handleEdit(user)}>
                  Edit
                </button>
                <button className='btn btn-danger btn-sm'>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className='modal show' tabIndex={-1} style={{ display: 'block' }}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Edit User</h5>
                <button type='button' className='btn-close' onClick={handleCloseModal}></button>
              </div>
              <div className='modal-body'>
                {selectedUser && (
                  <form>
                    <div className='mb-3'>
                      <label htmlFor='formRole' className='form-label'>
                        Role
                      </label>
                      <select
                        id='formRole'
                        className='form-select'
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
                    <div className='mb-3'>
                      <label htmlFor='formCurrentPermissions' className='form-label'>
                        Current Permissions
                      </label>
                      <select
                        id='formCurrentPermissions'
                        className='form-select'
                        multiple
                        value={currentPermissions}
                        disabled
                      >
                        {currentPermissions.map((permission) => (
                          <option key={permission} value={permission}>
                            {permission}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='mb-3'>
                      <label htmlFor='formAvailablePermissions' className='form-label'>
                        Available Permissions
                      </label>
                      <select
                        id='formAvailablePermissions'
                        className='form-select'
                        multiple
                        value={availablePermissions}
                        onChange={(e) =>
                          setAvailablePermissions(Array.from(e.target.selectedOptions, (option) => option.value))
                        }
                      >
                        {availablePermissions.map((permission) => (
                          <option key={permission} value={permission}>
                            {permission}
                          </option>
                        ))}
                      </select>
                    </div>
                  </form>
                )}
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary' onClick={handleCloseModal}>
                  Close
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
