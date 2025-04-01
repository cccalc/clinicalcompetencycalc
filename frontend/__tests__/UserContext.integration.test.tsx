import { render, waitFor, act } from '@testing-library/react';
import { UserProvider, useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';

const TEST_USER = {
  email: 'email@gmail.com',
  password: 'password',
};
const EXPECTED_VALUE = {
    role: 'authenticated',
    displayName: 'Tyler',
    userRoleDev: 'dev',
    userRoleAuthorized: 'authorized',
};
describe('UserContext (Integration)', () => {
  let supabase: ReturnType<typeof createClient>;

  // Start the supabase client.
  beforeAll(() => {
    supabase = createClient();
  });

  // Log out current user.
  afterEach(async () => {
    await act(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.auth.signOut();
    });
  });

  it('should handle user sign-in and state updates', async () => {
    const TestComponent = () => {
      const { user, displayName, email, userRoleDev, loading } = useUser();
      const role = user?.role;
      return (
        <div>
          <div>
            {loading ? 'Loading...' : email}
          </div>
          <div>
            {user ? role : 'undefined'}
          </div>
          <div>
            {displayName ? displayName : 'undefined'}
          </div>
          <div>
            {userRoleDev ? 'dev' : 'not-dev'}
          </div>
        </div>
      );
    };

    const { getByText } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await act(async () => {
      await supabase.auth.signInWithPassword(TEST_USER);
    });
    
    await waitFor(() => {
      expect(getByText(TEST_USER.email)).toBeInTheDocument();
      expect(getByText(EXPECTED_VALUE.role)).toBeInTheDocument();
      expect(getByText(EXPECTED_VALUE.displayName)).toBeInTheDocument();
      expect(getByText(EXPECTED_VALUE.userRoleDev)).toBeInTheDocument();
    });
  });

  it('should handle auth state changes', async () => {
    const TestComponent = () => {
      const { user } = useUser();
      return <div>{user ? 'Signed In' : 'Signed Out'}</div>;
    };

    const { getByText } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Initial state
    expect(getByText('Signed Out')).toBeInTheDocument();

    // Sign in
    await act(async () => {
      await supabase.auth.signInWithPassword(TEST_USER);
    });

    await waitFor(() => {
      expect(getByText('Signed In')).toBeInTheDocument();
    });

    // Sign out
    await act(async () => {
      await supabase.auth.signOut();
    });

    await waitFor(() => {
      expect(getByText('Signed Out')).toBeInTheDocument();
    });
  });
  
  it('should throw error when used outside UserProvider', () => {
    // Create a test component that uses the hook incorrectly
    const TestComponent = () => {
      useUser(); // This should throw
      return null;
    };

    // Verify the error is thrown
    expect(() => render(<TestComponent />))
      .toThrow('useUser must be used within a UserProvider');
    
  });

  it('should return context when used inside UserProvider', async () => {
    const TestComponent = () => {
      const { loading } = useUser();
      return <div>{loading ? 'Loading' : 'Ready'}</div>;
    };

    const { getByText } = render(
      <UserProvider>
      <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(getByText('Ready')).toBeInTheDocument();
    });
  });

  it('should provide access to all context values with proper loading handling', async () => {
    const ContextReader = () => {
      const context = useUser();
      return (
        <div>
              <span data-testid="email">{context.email}</span>
              <span data-testid="user-id">{context.user ? JSON.stringify(context.user) : 'null'}</span>
        </div>
      );
    };
    
    const { findByTestId } = render(
      <UserProvider>
        <ContextReader />
      </UserProvider>
    );
    
    await act(async () => {
      await supabase.auth.signInWithPassword(TEST_USER);
    });
  
    // Gives the user identification and email context.
    expect(await findByTestId('user-id')).not.toHaveTextContent('null');
    expect(await findByTestId('email')).toHaveTextContent(TEST_USER.email);
  });
});
