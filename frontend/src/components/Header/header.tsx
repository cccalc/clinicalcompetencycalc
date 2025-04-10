'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import logo from '@/components/ccc-logo-color.svg';
import NavLinks from './NavLinks';
import ProfileDropdown from './ProfileDropdown';
import ProfileSettingsModal from './ProfileSettingsModal';

/**
 * Header component
 *
 * Displays the application logo, role-based navigation links, and user profile controls.
 * Modal visibility is controlled locally with React state.
 */
const Header = () => {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);

  return (
    <header className='bg-white text-gray-800 p-2 shadow-md'>
      <div className='container mx-auto d-flex justify-content-between align-items-center flex-wrap'>
        {/* 🔹 App Logo and Title */}
        <Link href='/dashboard' className='d-flex align-items-center text-decoration-none'>
          <Image src={logo} alt='Logo' width={40} height={40} priority />
          <span className='ms-2 fs-4 fw-bold'>Clinical Competency Calculator</span>
        </Link>

        {/* 🔹 Conditional navigation and profile UI (only if user is logged in) */}
        {user && (
          <nav className='d-flex gap-3 align-items-center flex-wrap'>
            <NavLinks />
            <ProfileDropdown onOpenModal={() => setShowModal(true)} />
          </nav>
        )}
      </div>

      {/* 🔹 Modal rendered at root level for z-index layering */}
      <ProfileSettingsModal show={showModal} onClose={() => setShowModal(false)} />
    </header>
  );
};

export default Header;
