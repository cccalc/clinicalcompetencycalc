'use client';

import { useRef, useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext'; // exposes displayName & email :contentReference[oaicite:0]{index=0}

/**
 * ProfileDropdown
 *
 * ▸ Shows the signed‑in user’s name / email.
 * ▸ Opens either the Profile‑Settings modal or the Developer‑Ticket modal via
 *   callback props (keeps all modal logic in React).
 * ▸ Closes itself when you click outside the menu.
 */
interface ProfileDropdownProps {
  onOpenProfile: () => void; // open ProfileSettingsModal
  onOpenTicket: () => void; // open DeveloperTicketModal
}

export default function ProfileDropdown({ onOpenProfile, onOpenTicket }: ProfileDropdownProps) {
  const { displayName, email } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ── click‑outside to close ─────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowMenu(false);
    };

    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // ── render ────────────────────────────────────────────────
  return (
    <div className='dropdown' ref={ref}>
      <button
        className='btn btn-outline-secondary dropdown-toggle'
        type='button'
        onClick={() => setShowMenu((prev) => !prev)}
      >
        <i className='bi bi-person-circle'></i>
      </button>

      {showMenu && (
        <ul className='dropdown-menu dropdown-menu-end show'>
          {/* user info */}
          <li className='dropdown-item-text text-center no-select'>
            <strong className='no-pointer'>{displayName || 'User'}</strong>
            <br />
            <small className='text-muted no-pointer'>{email}</small>
          </li>

          <li>
            <hr className='dropdown-divider' />
          </li>

          {/* open profile settings */}
          <li>
            <button className='dropdown-item' onClick={onOpenProfile}>
              Profile Settings
            </button>
          </li>

          {/* open developer ticket modal */}
          <li>
            <button className='dropdown-item' onClick={onOpenTicket}>
              Report Issue/ Feature
            </button>
          </li>

          {/* logout */}
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
}
