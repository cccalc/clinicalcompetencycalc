'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';

import logo from '@/components/ccc-logo-color.svg';
import { useUser } from '@/context/UserContext';

const Header = () => {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isChanged, setIsChanged] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { user, userRoleAuthorized, userRoleRater } = useUser();

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name);
      setEmail(user.email);
    }
  }, [user]);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleSaveChanges = async () => {
    // Handle save changes logic here
    // For example, update the user profile in the database
    // and then update the context with the new user information
  };

  useEffect(() => {
    setIsChanged(displayName !== user?.display_name);
  }, [displayName, user?.display_name]);

  return (
    <header className='bg-white text-gray-800 p-2 shadow-md'>
      <div className='container mx-auto d-flex justify-content-between align-items-center flex-wrap'>
        <Link href='/dashboard' className='d-flex align-items-center text-decoration-none'>
          <Image src={logo} alt='Logo' width={40} height={40} />
          <span className='ms-2 fs-4 fw-bold'>Clinical Competency Calculator</span>
        </Link>
        <nav className='d-flex gap-3 align-items-center flex-wrap'>
          {userRoleAuthorized ? (
            <>
              <Link
                href='/admin-dashboard'
                className={`btn ${pathname === '/admin-dashboard' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              >
                All Users
              </Link>
              <Link
                href='/all-reports'
                className={`btn ${pathname === '/all-reports' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              >
                All Reports
              </Link>
            </>
          ) : userRoleRater ? (
            <>
              <Link
                href='/rater-dashboard'
                className={`btn ${pathname === '/rater-dashboard' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              >
                Rater Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href='/dashboard'
                className={`btn ${pathname === '/dashboard' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              >
                Dashboard
              </Link>
              <Link
                href='/form-requests'
                className={`btn ${pathname === '/form-requests' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              >
                Form Requests
              </Link>
              <Link
                href='/report'
                className={`btn ${pathname === '/report' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              >
                Report
              </Link>
            </>
          )}
          <div className='dropdown' ref={profileMenuRef}>
            <button className='btn btn-outline-secondary dropdown-toggle' type='button' onClick={toggleProfileMenu}>
              <i className='bi bi-person-circle'></i>
            </button>
            {showProfileMenu && (
              <ul className='dropdown-menu dropdown-menu-end show'>
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
        </nav>
      </div>

      {/* Profile Settings Modal */}
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
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
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
