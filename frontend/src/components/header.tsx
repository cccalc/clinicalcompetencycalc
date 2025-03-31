'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import logo from '@/components/ccc-logo-color.svg';
import { useUser } from '@/context/UserContext';
const supabase = createClient();
/**
 * Header component
 *
 *
 * Renders the top navigation bar with dynamic links based on the user's role.
 * Includes:
 * - Logo and app name
 * - Role-specific navigation links (Admin, Rater, Student)
 * - Profile dropdown for name/email, settings, and logout
 */
const Header = () => {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { user, displayName, email, userRoleAuthorized, userRoleRater, userRoleStudent, userRoleDev } = useUser();

  const [editedDisplayName, setEditedDisplayName] = useState(displayName);
  const [isChanged, setIsChanged] = useState(false);

  // Role shorthand booleans
  const isDev = userRoleDev;
  const isOnlyStudent = userRoleStudent && !isDev && !userRoleRater && !userRoleAuthorized;
  const isOnlyRater = userRoleRater && !isDev && !userRoleAuthorized;
  const isOnlyAuthorized = userRoleAuthorized && !isDev;

  /**
   * Update local editable display name when the user's name changes.
   */
  useEffect(() => {
    setEditedDisplayName(displayName);
  }, [displayName]);

  /**
   * Detect whether the display name input was changed.
   */
  useEffect(() => {
    setIsChanged(editedDisplayName !== displayName);
  }, [editedDisplayName, displayName]);

  /**
   * Toggles the visibility of the profile dropdown menu.
   */
  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  /**
   * Handles saving updated profile info (to be implemented).
   */
  const handleSaveChanges = async () => {
    if (!user) return; // Ensure user is authenticated

    try {
      const { error } = await supabase.from('profiles').update({ display_name: editedDisplayName }).eq('id', user.id);

      if (error) throw error;

      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setEditedDisplayName(updatedProfile?.display_name ?? '');

      alert('Display name updated successfully!');
    } catch (error) {
      console.error('Error updating display name:', error);
      alert('Failed to update display name.');
    }
    // Implement update logic (e.g., update Supabase profile)
    if (!user) return; // Ensure user is authenticated

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: editedDisplayName })
        .eq('id', user.id); 

      if (error) throw error;

      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setEditedDisplayName(updatedProfile?.display_name ?? '');

      alert('Display name updated successfully!');
    } catch (error) {
      console.error('Error updating display name:', error);
      alert('Failed to update display name.');
    }
  };

  /**
   * Closes the dropdown if clicking outside of it.
   */
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showProfileMenu]);

  return (
    <header className='bg-white text-gray-800 p-2 shadow-md'>
      <div className='container mx-auto d-flex justify-content-between align-items-center flex-wrap'>
        {/* Logo and app name */}
        <Link href='/dashboard' className='d-flex align-items-center text-decoration-none'>
          <Image src={logo} alt='Logo' width={40} height={40} />
          <span className='ms-2 fs-4 fw-bold'>Clinical Competency Calculator</span>
        </Link>

        {/* Navigation links */}
        <nav className='d-flex gap-3 align-items-center flex-wrap'>
          {user ? (
            <>
              {/* Student View */}
              {(isOnlyStudent || isDev) && (
                <>
                  <Link
                    href='/dashboard'
                    className={`btn ${pathname === '/dashboard' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href='/dashboard/student/form-requests'
                    className={`btn ${
                      pathname === '/dashboard/student/form-requests' ? 'btn-secondary' : 'btn-outline-secondary'
                    }`}
                  >
                    Request Assessment
                  </Link>
                  <Link
                    href='/dashboard/student/report'
                    className={`btn ${
                      pathname === '/dashboard/student/report' ? 'btn-secondary' : 'btn-outline-secondary'
                    }`}
                  >
                    Comprehensive Report
                  </Link>
                </>
              )}

              {/* Admin View */}
              {(isOnlyAuthorized || isDev) && (
                <>
                  <Link
                    href='/dashboard/admin/userList'
                    className={`btn ${
                      pathname === '/dashboard/admin/userList' ? 'btn-secondary' : 'btn-outline-secondary'
                    }`}
                  >
                    Manage Users
                  </Link>
                  <Link
                    href='/all-reports'
                    className={`btn ${pathname === '/all-reports' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  >
                    All Reports
                  </Link>
                </>
              )}

              {/* Rater View */}
              {(isOnlyRater || isDev) && (
                <>
                  <Link
                    href='/dashboard'
                    className={`btn ${pathname === '/dashboard' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  >
                    Home
                  </Link>
                </>
              )}

              {/* 🔹 Profile Dropdown */}
              <div className='dropdown' ref={profileMenuRef}>
                <button className='btn btn-outline-secondary dropdown-toggle' type='button' onClick={toggleProfileMenu}>
                  <i className='bi bi-person-circle'></i>
                </button>
                {showProfileMenu && (
                  <ul className='dropdown-menu dropdown-menu-end show'>
                    <li className='dropdown-item-text text-center no-select'>
                      <strong className='no-pointer'>{displayName || 'User'}</strong>
                      <br />
                      <small className='text-muted no-pointer'>{email}</small>
                    </li>
                    <li>
                      <hr className='dropdown-divider' />
                    </li>
                    <li>
                      <button className='dropdown-item' data-bs-toggle='modal' data-bs-target='#profileModal'>
                        Profile Settings
                      </button>
                    </li>
                    <li>
                      <form action='/auth/signout' method='post'>
                        <button className='dropdown-item' type='submit'>
                          Logout
                        </button>
                      </form>
                    </li>
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </nav>
      </div>

      {/* 🔹 Profile Settings Modal */}
      <div
        className='modal fade'
        id='profileModal'
        tabIndex={-1}
        aria-labelledby='profileModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id='profileModalLabel'>
                Profile Settings
              </h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
            </div>
            <div className='modal-body'>
              <form>
                <div className='mb-3'>
                  <label htmlFor='displayName' className='form-label'>
                    Display Name
                  </label>
                  <input
                    type='text'
                    className='form-control'
                    id='displayName'
                    value={editedDisplayName}
                    onChange={(e) => setEditedDisplayName(e.target.value)}
                  />
                </div>
                <div className='mb-3'>
                  <label htmlFor='email' className='form-label'>
                    Email
                  </label>
                  <input type='email' className='form-control' id='email' value={email} disabled />
                </div>
              </form>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>
                Close
              </button>
              <button type='button' className='btn btn-primary' onClick={handleSaveChanges} disabled={!isChanged}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
