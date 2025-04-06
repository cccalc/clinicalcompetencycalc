'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/utils/supabase/client';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import MarkdownPreview from '@uiw/react-markdown-preview';

// Dynamically load the Markdown editor (client-side only)
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// Safe Markdown parser (HTML disabled)
const mdParser = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
});

type Announcement = {
  id: string;
  message: string;
  start_date: string;
  end_date: string;
  announcement_type: 'info' | 'warning' | 'danger';
};

/**
 * Admin interface for creating, editing, and deleting system-wide announcements.
 * Markdown is supported in the message editor and rendered safely with a custom parser.
 *
 * @component
 */
export default function AdminAnnouncements() {
  const supabase = createClient();

  const [message, setMessage] = useState('');
  const [type, setType] = useState<Announcement['announcement_type']>('info');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  /**
   * Fetches all announcements from Supabase and stores them in local state.
   *
   * @returns {Promise<void>}
   */
  const fetchAnnouncements = useCallback(async (): Promise<void> => {
    const { data, error } = await supabase.from('announcements').select('*').order('start_date', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
    } else {
      setAnnouncements(data as Announcement[]);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  /**
   * Handles saving or updating an announcement.
   * Sanitizes input before storing in the database.
   *
   * @returns {Promise<void>}
   */
  const handleSave = async (): Promise<void> => {
    if (!message.trim() || !startDate || !endDate) {
      alert('Please fill out all required fields.');
      return;
    }

    setSaving(true);
    setSuccess(false);

    // Sanitize input to prevent HTML injection
    const cleanedMessage: string = sanitizeHtml(message, {
      allowedTags: [], // Strip all HTML
      allowedAttributes: {},
    });

    if (editingId) {
      const { error } = await supabase
        .from('announcements')
        .update({
          message: cleanedMessage,
          start_date: startDate,
          end_date: endDate,
          announcement_type: type,
        })
        .eq('id', editingId);

      setSaving(false);

      if (error) {
        console.error('Update error:', error);
        alert('Failed to update announcement.');
      } else {
        setSuccess(true);
        resetForm();
        fetchAnnouncements();
      }
    } else {
      const { error } = await supabase.from('announcements').insert({
        message: cleanedMessage,
        start_date: startDate,
        end_date: endDate,
        announcement_type: type,
      });

      setSaving(false);

      if (error) {
        console.error('Insert error:', error);
        alert('Failed to save announcement.');
      } else {
        setSuccess(true);
        resetForm();
        fetchAnnouncements();
      }
    }
  };

  /**
   * Deletes an announcement by ID.
   *
   * @param {string} id - ID of the announcement to delete
   * @returns {Promise<void>}
   */
  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      alert('Failed to delete announcement.');
    } else {
      fetchAnnouncements();
    }
  };

  /**
   * Begins editing an existing announcement.
   *
   * @param {Announcement} announcement - Announcement data to prefill the form
   */
  const startEdit = (announcement: Announcement): void => {
    setEditingId(announcement.id);
    setMessage(announcement.message);
    setStartDate(announcement.start_date);
    setEndDate(announcement.end_date);
    setType(announcement.announcement_type);
  };

  /**
   * Resets the announcement form to its default state.
   */
  const resetForm = (): void => {
    setEditingId(null);
    setMessage('');
    setStartDate('');
    setEndDate('');
    setType('info');
  };

  return (
    <div className='p-3 rounded' style={{ backgroundColor: '#f1f3f5' }}>
      <div className='card shadow-sm p-3 rounded border-0' style={{ backgroundColor: 'white' }}>
        <div className='card-header bg-white border-bottom pb-2'>
          <h5 className='m-0 text-dark'>{editingId ? 'Edit Announcement' : 'Create System Announcement'}</h5>
        </div>

        <div className='card-body px-2'>
          <div className='mb-3'>
            <label className='form-label'>Announcement Message (Markdown Supported)</label>
            <div data-color-mode='light'>
              <MDEditor
                value={message}
                onChange={(val) => setMessage(val || '')}
                height={200}
                preview='edit' // Disable live preview for safety
                hideToolbar={true}
              />
            </div>
          </div>

          {message && (
            <div className='mb-3'>
              <label className='form-label'>Preview</label>
              <MarkdownPreview
                source={mdParser.render(message)}
                style={{ backgroundColor: '#D3D3D3', padding: '1rem', borderRadius: '6px', color: '#212529' }}
              />
            </div>
          )}

          <div className='row mb-3'>
            <div className='col-md-4'>
              <label className='form-label'>Type</label>
              <select
                className='form-select'
                value={type}
                onChange={(e) => setType(e.target.value as Announcement['announcement_type'])}
              >
                <option value='info'>Info</option>
                <option value='warning'>Warning</option>
                <option value='danger'>Danger</option>
              </select>
            </div>
            <div className='col-md-4'>
              <label className='form-label'>Start Date</label>
              <input
                type='datetime-local'
                className='form-control'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className='col-md-4'>
              <label className='form-label'>End Date</label>
              <input
                type='datetime-local'
                className='form-control'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button className='btn btn-primary w-100' onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update Announcement' : 'Save Announcement'}
          </button>

          {success && (
            <div className='alert alert-success mt-3'>
              <i className='bi bi-check-circle-fill me-2'></i> Announcement {editingId ? 'updated' : 'saved'}!
            </div>
          )}
        </div>
      </div>

      <div className='mt-4'>
        <h6 className='text-dark'>Existing Announcements</h6>
        {announcements.length === 0 ? (
          <p className='text-muted'>No announcements found.</p>
        ) : (
          <ul className='list-group'>
            {announcements.map((a) => (
              <li key={a.id} className='list-group-item d-flex justify-content-between align-items-start'>
                <div>
                  <div className='fw-bold'>
                    {a.announcement_type.toUpperCase()} | {new Date(a.start_date).toLocaleString()} →{' '}
                    {new Date(a.end_date).toLocaleString()}
                  </div>
                  <div className='small text-muted'>
                    {a.message.slice(0, 100)}
                    {a.message.length > 100 && '…'}
                  </div>
                </div>
                <div className='ms-3'>
                  <button className='btn btn-sm btn-outline-primary me-2' onClick={() => startEdit(a)}>
                    <i className='bi bi-pencil'></i>
                  </button>
                  <button className='btn btn-sm btn-outline-danger' onClick={() => handleDelete(a.id)}>
                    <i className='bi bi-trash'></i>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
