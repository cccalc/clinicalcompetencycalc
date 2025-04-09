'use client';

import { useRef, useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

interface ProfileDropdownProps {
  onOpenModal: () => void;
}

/**
 * ProfileDropdown component
 *
 * Dropdown menu for user actions:
 * - Shows display name and email
 * - Allows opening profile settings modal
 * - Provides logout form
 */
const ProfileDropdown = ({ onOpenModal }: ProfileDropdownProps) => {
  const { displayName, email } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className='dropdown' ref={ref}>
      <button
        className='btn btn-outline-secondary dropdown-toggle'
        type='button'
        onClick={() => setShowMenu((p) => !p)}
      >
        <i className='bi bi-person-circle'></i>
      </button>

      {showMenu && (
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
            <button className='dropdown-item' onClick={onOpenModal}>
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
  );
};

export default ProfileDropdown;
