'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

const supabase = createClient();

/**
 * Describes the shape of the user context, including
 * the current user, profile details, role flags, and loading state.
 */
interface UserContextType {
  user: User | null;
  displayName: string;
  email: string;
  userRoleAuthorized: boolean;
  userRoleRater: boolean;
  userRoleStudent: boolean;
  userRoleDev: boolean;
  loading: boolean;
}

// Create a React context to store user session and role info
export const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * UserProvider component to wrap the application and provide user context.
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Child components that consume the user context
 * @returns {JSX.Element}
 */
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [userRoleAuthorized, setUserRoleAuthorized] = useState(false);
  const [userRoleRater, setUserRoleRater] = useState(false);
  const [userRoleStudent, setUserRoleStudent] = useState(false);
  const [userRoleDev, setUserRoleDev] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches the display name from the `profiles` table using the user's ID.
   *
   * @param {string} userId - Supabase user ID
   * @returns {Promise<string | null>} - Display name or null if error occurs
   */
  const fetchUserProfile = async (userId: string): Promise<string | null> => {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return profileData.display_name;
  };

  /**
   * Calls a Supabase RPC to get the user role by ID.
   *
   * @param {string} userId - Supabase user ID
   * @returns {Promise<string | null>} - Role string (e.g., 'admin', 'student') or null on error
   */
  const fetchUserRole = async (userId: string): Promise<string | null> => {
    const { data, error } = await supabase.rpc('get_user_role_by_user_id', {
      id: userId,
    });

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data as string | null;
  };

  /**
   * Fetches the current authenticated user, profile, and role,
   * and updates all state variables accordingly.
   */
  const fetchUser = useCallback(async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      // Reset state if no session exists
      setUser(null);
      setDisplayName('');
      setEmail('');
      setUserRoleAuthorized(false);
      setUserRoleRater(false);
      setUserRoleStudent(false);
      setUserRoleDev(false);
      setLoading(false);
      return;
    }

    const user = session.user;
    setUser(user);
    setEmail(user.email ?? '');

    const fetchedDisplayName = await fetchUserProfile(user.id);
    setDisplayName(fetchedDisplayName ?? '');

    const role = await fetchUserRole(user.id);
    setUserRoleDev(role === 'dev');
    setUserRoleAuthorized(role === 'admin');
    setUserRoleRater(role === 'rater');
    setUserRoleStudent(role === 'student');

    setLoading(false);
  }, []);

  /**
   * Initializes the user state and listens for auth state changes (sign-in/out, token refresh).
   * Automatically updates the user context accordingly.
   */
  useEffect(() => {
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        // Reset user state on sign-out
        setUser(null);
        setDisplayName('');
        setEmail('');
        setUserRoleAuthorized(false);
        setUserRoleRater(false);
        setUserRoleStudent(false);
        setUserRoleDev(false);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        displayName,
        email,
        userRoleAuthorized,
        userRoleRater,
        userRoleStudent,
        userRoleDev,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

/**
 * Custom hook to access the user context safely.
 *
 * @throws {Error} If used outside of a <UserProvider>
 * @returns {UserContextType} - The current user context
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
