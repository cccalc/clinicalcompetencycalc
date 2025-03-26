import { render, screen, act, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from '@/context/UserContext'; // Adjust path as necessary
import { createClient } from '@/utils/supabase/client';

// Test component that consumes the user context
const TestComponent = () => {
  const { user, displayName, email, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user ? `Welcome ${displayName}` : 'No user'}</h1>
      <p>{email ? `Email: ${email}` : 'No email'}</p>
    </div>
  );
};

describe('UserProvider', () => {

  test('loads user context correctly', async () => {
    // Render the provider with the test component
    const supabase = createClient();
    try {
        // Log in the user
        const { } = await supabase.auth.signInWithPassword({
          email: "tyler101price@gmail.com",
          password: "Fireball",
        });
      } catch (error) {
        console.error('Error:', error);
      }
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Check that loading text appears first
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // Wait for the user context to be populated
    await waitFor(() => screen.getByText(/Welcome/));

    // You can now check if the user details are rendered
    expect(screen.getByText(/Welcome/)).toBeInTheDocument();
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
  });
});
