'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface ProfileSettingsModalProps {
  show: boolean;
  onClose: () => void;
}

/**
 * ProfileSettingsModal component
 *
 * Bootstrap-styled modal rendered manually using React state only.
 * Provides editable display name, shows email, and saves to Supabase.
 */
const ProfileSettingsModal = ({ show, onClose }: ProfileSettingsModalProps) => {
  const { user, displayName, email } = useUser();
  const [editedDisplayName, setEditedDisplayName] = useState(displayName);

  // Sync input state when context updates
  useEffect(() => {
    setEditedDisplayName(displayName);
  }, [displayName]);

  const isChanged = editedDisplayName !== displayName;

  // Save updated display name to Supabase
  const handleSave = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('profiles').update({ display_name: editedDisplayName }).eq('id', user.id);

      if (error) throw error;

      alert('Display name updated successfully!');
      onClose();
    } catch (err) {
      console.error('Failed to update display name:', err);
      alert('Failed to update display name.');
    }
  }, [editedDisplayName, user, onClose]);

  // Do not render if modal is not active
  if (!show) return null;

  return (
    <>
      {/* Simulated Bootstrap modal backdrop */}
      <div className='modal-backdrop fade show'></div>

      {/* Bootstrap-styled modal controlled by React */}
      <div className='modal fade show d-block' tabIndex={-1} role='dialog' onClick={onClose}>
        <div className='modal-dialog' role='document' onClick={(e) => e.stopPropagation()}>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Profile Settings</h5>
              <button type='button' className='btn-close' aria-label='Close' onClick={onClose}></button>
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
              <button className='btn btn-secondary' onClick={onClose}>
                Close
              </button>
              <button className='btn btn-primary' onClick={handleSave} disabled={!isChanged}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSettingsModal;
