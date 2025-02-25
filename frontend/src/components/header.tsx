import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '@/components/ccc-logo-color.svg'; // Update the path to your logo
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const Header = () => {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [isChanged, setIsChanged] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('No user');

      if (user.email) setEmail(user.email);
      else console.log('No email found');

      const {
        data,
        error: profileError,
        status,
      } = await supabase.from('profiles').select('display_name').eq('id', user.id).single();

      if (profileError && status !== 406) {
        console.log(profileError);
        throw profileError;
      }

      if (data) {
        setDisplayName(data.display_name);
        setOriginalDisplayName(data.display_name);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      alert(`Error loading user data: ${JSON.stringify(error)}`);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleSaveChanges = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('No user');

      const updates = {
        id: user.id,
        display_name: displayName,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase.from('profiles').upsert(updates);
      if (updateError) throw updateError;

      setOriginalDisplayName(displayName);
      setIsChanged(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${JSON.stringify(error)}`);
    }
  };

  useEffect(() => {
    setIsChanged(displayName !== originalDisplayName);
  }, [displayName, originalDisplayName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuRef]);

  return (
    <header className='bg-white text-gray-800 p-2 shadow-md'>
      <div className='container mx-auto d-flex justify-content-between align-items-center'>
        <Link href='/' className='d-flex align-items-center text-decoration-none'>
          <Image src={logo} alt='Logo' width={40} height={40} />
          <span className='ms-2 fs-4 fw-bold'>Clinical Competency Calculator</span>
        </Link>
        <nav className='d-flex gap-3 align-items-center'>
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
          <Link href='/report' className={`btn ${pathname === '/report' ? 'btn-secondary' : 'btn-outline-secondary'}`}>
            Report
          </Link>
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
