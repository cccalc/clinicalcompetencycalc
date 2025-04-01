// adminAnnouncements.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminAnnouncements from '@/components/(AdminComponents)/AdminAnnouncements';
import { createClient } from '@/utils/supabase/client';

let mockSupabaseData;
let mockSupabaseError = null;

// Mock the supabase client
jest.mock('@/utils/supabase/client', () => ({
    createClient: jest.fn(() => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn().mockImplementation(() =>
            Promise.resolve({ data: mockSupabaseData, error: mockSupabaseError })
          )
        }))
      })),
    })),
}));

// Mock MDEditor since it's dynamically imported
jest.mock('@uiw/react-md-editor', () => ({
  __esModule: true,
  default: jest.fn(({ value, onChange }) => (
    <textarea
      data-testid="mdeditor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )),
}));

describe('AdminAnnouncements Component', () => {
  const mockAnnouncements: Announcement[] = [
    {
      id: '1',
      message: 'Test announcement 1',
      start_date: '2023-01-01T00:00:00',
      end_date: '2023-01-31T00:00:00',
      announcement_type: 'info' as const
    },
    {
      id: '2',
      message: 'Test announcement 2',
      start_date: '2023-02-01T00:00:00',
      end_date: '2023-02-28T00:00:00',
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
    // Mock successful insert
    (createClient().from('announcements').insert as jest.Mock).mockResolvedValue({
      error: null,
    });

    render(<AdminAnnouncements />);
    
    // Fill out the form
    fireEvent.change(screen.getByTestId('mdeditor'), {
      target: { value: 'New test announcement' },
    });
    fireEvent.change(screen.getByLabelText('Type'), {
      target: { value: 'danger' },
    });
    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2023-03-01T00:00' },
    });
    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2023-03-31T00:00' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Save Announcement'));

    // Check that insert was called with correct data
    await waitFor(() => {
      expect(createClient().from('announcements').insert).toHaveBeenCalledWith({
        message: 'New test announcement',
        announcement_type: 'danger',
        start_date: '2023-03-01T00:00',
        end_date: '2023-03-31T00:00',
      });
    });

    // Check success message
    expect(await screen.findByText(/Announcement saved!/)).toBeInTheDocument();
  });

//   test('shows validation errors for empty fields', async () => {
//     const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
//     render(<AdminAnnouncements />);
    
//     // Try to submit empty form
//     fireEvent.click(screen.getByText('Save Announcement'));
    
//     expect(alertMock).toHaveBeenCalledWith('Please fill out all required fields.');
//     alertMock.mockRestore();
//   });

//   test('edits an existing announcement', async () => {
//     // Mock successful update
//     (createClient().from('announcements').update as jest.Mock).mockResolvedValue({
//       error: null,
//     });

//     render(<AdminAnnouncements />);
    
//     // Wait for announcements to load
//     await screen.findByText('Test announcement 1');
    
//     // Click edit button on first announcement
//     const editButtons = screen.getAllByRole('button', { name: /edit/i });
//     fireEvent.click(editButtons[0]);
    
//     // Verify form is populated
//     expect(screen.getByText('Edit Announcement')).toBeInTheDocument();
//     expect(screen.getByTestId('mdeditor')).toHaveValue('Test announcement 1');
    
//     // Make changes and submit
//     fireEvent.change(screen.getByTestId('mdeditor'), {
//       target: { value: 'Updated announcement' },
//     });
//     fireEvent.click(screen.getByText('Update Announcement'));
    
//     // Check that update was called with correct data
//     await waitFor(() => {
//       expect(createClient().from('announcements').update).toHaveBeenCalledWith({
//         message: 'Updated announcement',
//         announcement_type: 'info',
//         start_date: '2023-01-01T00:00:00',
//         end_date: '2023-01-31T00:00:00',
//       });
//       expect(createClient().from('announcements').update).toHaveBeenCalledWith(
//         expect.anything(),
//         { eq: 'id', value: '1' }
//       );
//     });
//   });

//   test('deletes an announcement', async () => {
//     // Mock confirmation dialog and successful delete
//     window.confirm = jest.fn(() => true);
//     (createClient().from('announcements').delete as jest.Mock).mockResolvedValue({
//       error: null,
//     });

//     render(<AdminAnnouncements />);
    
//     // Wait for announcements to load
//     await screen.findByText('Test announcement 1');
    
//     // Click delete button on first announcement
//     const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
//     fireEvent.click(deleteButtons[0]);
    
//     // Verify confirmation was shown
//     expect(window.confirm).toHaveBeenCalledWith(
//       'Are you sure you want to delete this announcement?'
//     );
    
//     // Verify delete was called
//     await waitFor(() => {
//       expect(createClient().from('announcements').delete).toHaveBeenCalled();
//     });
//   });

//   test('shows error when fetch fails', async () => {
//     const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
//     (createClient().from('announcements').select().order as jest.Mock).mockResolvedValue({
//       data: null,
//       error: new Error('Fetch failed'),
//     });

//     render(<AdminAnnouncements />);
    
//     await waitFor(() => {
//       expect(consoleError).toHaveBeenCalledWith('Fetch error:', expect.any(Error));
//     });
    
//     consoleError.mockRestore();
//   });

//   test('shows empty state when no announcements exist', async () => {
//     (createClient().from('announcements').select().order as jest.Mock).mockResolvedValue({
//       data: [],
//       error: null,
//     });

//     render(<AdminAnnouncements />);
    
//     expect(await screen.findByText('No announcements found.')).toBeInTheDocument();
//   });
});