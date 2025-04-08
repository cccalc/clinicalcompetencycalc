import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from '@/context/UserContext';

const contextValueCallback = jest.fn();

// Define types for mocked Supabase client
type MockSupabaseType = {
  auth: {
    onAuthStateChange: jest.Mock;
    getSession: jest.Mock;
  };
  from: jest.Mock;
  rpc: jest.Mock;
};

// Mock the modules before importing them in the component
jest.mock('@/utils/supabase/client', () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockImplementation(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    }),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null })
  };
  
  return {
    createClient: jest.fn().mockReturnValue(mockSupabase)
  };
});

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn()
}));

// Test component to consume the UserContext
interface TestConsumerProps {
  onContextValue: (value: any) => void;
}

const TestConsumer: React.FC<TestConsumerProps> = ({ onContextValue }) => {
  const userContext = useUser();
  React.useEffect(() => {
    onContextValue(userContext);
  }, [onContextValue, userContext]);
  return <div>Test Consumer</div>;
};

describe('UserContext', () => {
  let mockSupabase: MockSupabaseType;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get access to the mocked supabase client for each test
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@/utils/supabase/client');
    mockSupabase = createClient();
    
    // Set up the auth change callback capture
    mockSupabase.auth.onAuthStateChange.mockImplementation(() => {
      return {
        data: { subscription: { unsubscribe: jest.fn() } }
      };
    });
  });

  test('provides null user and default values when not authenticated', async () => {
    // Setup mock to return no session
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null }
    });

    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContextValue={contextValueCallback} />
        </UserProvider>
      );
    });

    await waitFor(() => {
      expect(contextValueCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          user: null,
          displayName: '',
          email: '',
          userRoleAuthorized: false,
          userRoleRater: false,
          userRoleStudent: false,
          userRoleDev: false,
          loading: false,
        })
      );
    });
  });

  test('sets user data and admin role correctly', async () => {
    // Mock user session
    const mockUser = { id: 'user-123', email: 'admin@example.com' };
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });
    // Mock admin profile fetch
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: { display_name: 'Admin User' },
      error: null,
    });
    // Mock role fetch (admin)
    mockSupabase.rpc.mockResolvedValueOnce({
      data: 'admin',
      error: null,
    });


    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContextValue={contextValueCallback} />
        </UserProvider>
      );
    });

    await waitFor(() => {
      // The last call should have the final state after loading
      const lastCall = contextValueCallback.mock.calls[contextValueCallback.mock.calls.length - 1][0];
      expect(lastCall).toEqual({
        user: mockUser,
        displayName: 'Admin User',
        email: 'admin@example.com',
        userRoleAuthorized: true,
        userRoleRater: false,
        userRoleStudent: false,
        userRoleDev: false,
        loading: false,
      });
    });

    // Verify supabase calls
    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_role_by_user_id', { id: 'user-123' });
  });

  test('sets user data and student role correctly', async () => {
    // Mock user session
    const mockUser = { id: 'user-456', email: 'student@example.com' };
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });
    // Mock student profile fetch
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: { display_name: 'Student User' },
      error: null,
    });
    // Mock role fetch (student)
    mockSupabase.rpc.mockResolvedValueOnce({
      data: 'student',
      error: null,
    });

    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContextValue={contextValueCallback} />
        </UserProvider>
      );
    });

    await waitFor(() => {
      const lastCall = contextValueCallback.mock.calls[contextValueCallback.mock.calls.length - 1][0];
      expect(lastCall).toEqual({
        user: mockUser,
        displayName: 'Student User',
        email: 'student@example.com',
        userRoleAuthorized: false,
        userRoleRater: false,
        userRoleStudent: true,
        userRoleDev: false,
        loading: false,
      });
    });
  });

  test('sets user data and rater role correctly', async () => {
    const mockUser = { id: 'user-789', email: 'rater@example.com' };
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });
    // Mock rater profile fetch
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: { display_name: 'Rater User' },
      error: null,
    });
    // Mock role fetch (rater)
    mockSupabase.rpc.mockResolvedValueOnce({
      data: 'rater',
      error: null,
    });

    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContextValue={contextValueCallback} />
        </UserProvider>
      );
    });

    await waitFor(() => {
      const lastCall = contextValueCallback.mock.calls[contextValueCallback.mock.calls.length - 1][0];
      expect(lastCall).toEqual({
        user: mockUser,
        displayName: 'Rater User',
        email: 'rater@example.com',
        userRoleAuthorized: false,
        userRoleRater: true,
        userRoleStudent: false,
        userRoleDev: false,
        loading: false,
      });
    });
  });

  test('sets user data and dev role correctly', async () => {
    const mockUser = { id: 'user-101', email: 'dev@example.com' };
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });
    // Mock dev profile fetch
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: { display_name: 'Developer' },
      error: null,
    });
    // Mock role fetch (dev)
    mockSupabase.rpc.mockResolvedValueOnce({
      data: 'dev',
      error: null,
    });
    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContextValue={contextValueCallback} />
        </UserProvider>
      );
    });

    await waitFor(() => {
      const lastCall = contextValueCallback.mock.calls[contextValueCallback.mock.calls.length - 1][0];
      expect(lastCall).toEqual({
        user: mockUser,
        displayName: 'Developer',
        email: 'dev@example.com',
        userRoleAuthorized: false,
        userRoleRater: false,
        userRoleStudent: false,
        userRoleDev: true,
        loading: false,
      });
    });
  });

  test('handles sign out event correctly', async () => {
    // Initial state - user is logged in
    const mockUser = { id: 'user-202', email: 'dev@example.com' };
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: { display_name: 'Developer' },
      error: null,
    });
    mockSupabase.rpc.mockResolvedValueOnce({
      data: 'dev',
      error: null,
    });

    // Simulate sign out
    let authChangeCallback: (event: string) => void;
    mockSupabase.auth.onAuthStateChange.mockImplementationOnce((callback: any) => {
      authChangeCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    });

    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContextValue={contextValueCallback} />
        </UserProvider>
      );
    });

    // Wait for initial state to be set
    await waitFor(() => {
      const calls = contextValueCallback.mock.calls;
      const loadedState = calls[calls.length - 1][0];
      expect(loadedState.userRoleDev).toBe(true);
    });

    // Simulate sign out event
    await act(async () => {
      authChangeCallback('SIGNED_OUT');
    });

    // Verify sign out reset user state
    await waitFor(() => {
      const lastCall = contextValueCallback.mock.calls[contextValueCallback.mock.calls.length - 1][0];
      expect(lastCall).toEqual({
        user: null,
        displayName: '',
        email: '',
        userRoleAuthorized: false,
        userRoleRater: false,
        userRoleStudent: false,
        userRoleDev: false,
        loading: false,
      });
    });
  });

  test('handles token refresh event correctly', async () => {
    // Initial state - user is logged in
    let mockUser = { id: 'user-303', email: 'student@example.com' };
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: { display_name: 'Student User' },
      error: null,
    });
    mockSupabase.rpc.mockResolvedValueOnce({
      data: 'student',
      error: null,
    });

    // Simulate token refresh
    let authChangeCallback: (event: string) => void;
    mockSupabase.auth.onAuthStateChange.mockImplementationOnce((callback: any) => {
      authChangeCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    });

    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContextValue={contextValueCallback} />
        </UserProvider>
      );
    });

    // Wait for initial state to be set
    await waitFor(() => {
      const calls = contextValueCallback.mock.calls;
      const loadedState = calls[calls.length - 1][0];
      expect(loadedState.userRoleStudent).toBe(true);
    });

    // Reset mocks for the token refresh scenario
    mockSupabase.auth.getSession.mockReset();
    mockSupabase.from().select().eq().single.mockReset();
    mockSupabase.rpc.mockReset();

    // Updated user info for after token refresh
    mockUser = { id: 'user-303', email: 'updated@example.com' };
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: { display_name: 'Updated Name' },
      error: null,
    });
    mockSupabase.rpc.mockResolvedValueOnce({
      data: 'admin',
      error: null,
    });

    // Simulate token refresh event
    await act(async () => {
      authChangeCallback('TOKEN_REFRESHED');
    });

    // Verify user state is updated after token refresh
    await waitFor(() => {
      const lastCall = contextValueCallback.mock.calls[contextValueCallback.mock.calls.length - 1][0];
      expect(lastCall).toEqual({
        user: mockUser,
        displayName: 'Updated Name',
        email: 'updated@example.com',
        userRoleAuthorized: true,
        userRoleRater: false,
        userRoleStudent: false,
        userRoleDev: false,
        loading: false,
      });
    });
  });

  test('handles errors when fetching profile data', async () => {
    // Suppress expected console errors
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    // Mock session
    const mockUser = { id: 'error-user', email: 'error@example.com' };
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: new Error('Failed to fetch profile'),
    });
    mockSupabase.rpc.mockResolvedValueOnce({
      data: 'rater',
      error: null,
    });

    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContextValue={contextValueCallback} />
        </UserProvider>
      );
    });
    
    // Verify it handles the error gracefully. Display name should be empty on an error
    await waitFor(() => {
      const lastCall = contextValueCallback.mock.calls[contextValueCallback.mock.calls.length - 1][0];
      expect(lastCall).toEqual({
        user: mockUser,
        displayName: '',
        email: 'error@example.com',
        userRoleAuthorized: false,
        userRoleRater: true,
        userRoleStudent: false,
        userRoleDev: false,
        loading: false,
      });
    });
    consoleErrorSpy.mockRestore();
  });

  test('handles errors when fetching user role', async () => {
    // Suppress expected console errors
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock session
    const mockUser = { id: 'role-error', email: 'role@example.com' };
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: { display_name: 'Role Error User' },
      error: null,
    });
    mockSupabase.rpc.mockResolvedValueOnce({
      data: null,
      error: new Error('Failed to fetch role'),
    });

    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContextValue={contextValueCallback} />
        </UserProvider>
      );
    });

    // Verify it handles the error gracefully
    await waitFor(() => {
      const lastCall = contextValueCallback.mock.calls[contextValueCallback.mock.calls.length - 1][0];
      expect(lastCall).toEqual({
        user: mockUser,
        displayName: 'Role Error User',
        email: 'role@example.com',
        userRoleAuthorized: false,
        userRoleRater: false,
        userRoleStudent: false,
        userRoleDev: false,
        loading: false,
      });
    });
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});