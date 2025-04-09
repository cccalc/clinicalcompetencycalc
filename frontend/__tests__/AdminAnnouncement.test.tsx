// adminAnnouncements.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AdminAnnouncements from '@/components/(AdminComponents)/AdminAnnouncements';
import { createClient } from '@/utils/supabase/client';

let mockSupabaseData: ({ id: string; message: string; start_date: string; end_date: string; announcement_type: "info"; } | { id: string; message: string; start_date: string; end_date: string; announcement_type: "warning"; })[];
const mockSupabaseError = null;

// Mock Supabase
jest.mock('@/utils/supabase/client', () => ({
    createClient: jest.fn(() => ({
      from: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockImplementation(() =>
          Promise.resolve({ data: mockSupabaseData, error: mockSupabaseError })
        ),
        insert: jest.fn().mockImplementation(() =>
          Promise.resolve({ data: mockSupabaseData, error: mockSupabaseError })
        ),
        update: jest.fn(() => ({
          eq: jest.fn().mockImplementation(() =>
            Promise.resolve({ data: mockSupabaseData, error: mockSupabaseError })
          ),
        })),
      })),
    }))
  }));

describe('AdminAnnouncements Component', () => {
  const mockAnnouncements = [
    {
      id: '1',
      message: 'Test announcement 1',
      start_date: '2023-01-01T00:00:00',
      end_date: '2023-01-31T01:00:00',
      announcement_type: 'info' as const
    },
    {
      id: '2',
      message: 'Test announcement 2',
      start_date: '2023-02-01T01:00:00',
      end_date: '2023-02-28T02:00:00',
      announcement_type: 'warning' as const
    },
  ];

  beforeEach(() => {
    // // Reset all mocks before each test
    // jest.clearAllMocks();
    mockSupabaseData = mockAnnouncements;
    // Default mock implementation for fetch
    (createClient().from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockSupabaseData, // Return the test data
            error: null
          })
        })
      });
  });

  test('renders correctly with initial state', async () => {
    const { container } = render(<AdminAnnouncements />);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
    
    // Check header
    expect(screen.getByText('Create System Announcement')).toBeInTheDocument();
    expect(screen.getByText('Announcement Message (Markdown Supported)')).toBeInTheDocument();
    // Check form fields
    expect(screen.getByTestId('mdeditor')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    
    // Check existing announcements section
    expect(screen.getByText('Existing Announcements')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Test announcement 1')).toBeInTheDocument();
      expect(screen.getByText('Test announcement 2')).toBeInTheDocument();
    });
  });

  test('creates a new announcement successfully', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    
    const mockFrom = jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn().mockResolvedValue({
          data: mockSupabaseData,
          error: null
        })
      })),
      insert: mockInsert
    }));
  
    // Override the mock implementation
    (createClient as jest.Mock).mockImplementation(() => ({
      from: mockFrom
    }));
  
    render(<AdminAnnouncements />);
    await waitFor(() => {
      expect(screen.getByText('Test announcement 1')).toBeInTheDocument();
    });
  
    // Fill out the form
    act(() => {
      fireEvent.change(screen.getByTestId('mdeditor'), {
        target: { value: 'New test announcement' },
      });
      fireEvent.change(screen.getByRole('combobox', { name: /type/i }), {
        target: { value: 'danger' },
      });
      fireEvent.change(screen.getByLabelText(/start date/i), {
        target: { value: '2023-03-01T00:00' },
      });
      fireEvent.change(screen.getByLabelText(/end date/i), {
        target: { value: '2023-03-31T00:00' },
      });
      // Click the save button
    });
    fireEvent.click(screen.getByRole('button', { name: /save announcement/i }));

    // Verify the insert call was made with correct data
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        message: 'New test announcement',
        announcement_type: 'danger',
        start_date: '2023-03-01T00:00',
        end_date: '2023-03-31T00:00',
      });
    });
  
    // Verify success message
    expect(await screen.findByText(/Announcement saved!/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<AdminAnnouncements />);
    
    // Try to submit empty form
    waitFor(() => {
        fireEvent.click(screen.getByText('Save Announcement'));
    });
    expect(alertMock).toHaveBeenCalledWith('Please fill out all required fields.');
    alertMock.mockRestore();
  });

  test('shows error when fetch fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (createClient().from('announcements').select().order as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('Fetch failed'),
    });

    render(<AdminAnnouncements />);
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Fetch error:', expect.any(Error));
    });
    
    consoleError.mockRestore();
  });

  test('shows empty state when no announcements exist', async () => {
    (createClient().from('announcements').select().order as jest.Mock).mockResolvedValue({
      data: [],
      error: null,
    });

    render(<AdminAnnouncements />);
    
    expect(await screen.findByText('No announcements found.')).toBeInTheDocument();
  });
});