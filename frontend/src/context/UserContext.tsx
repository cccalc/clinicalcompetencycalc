'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

const supabase = createClient();

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

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [userRoleAuthorized, setUserRoleAuthorized] = useState(false);
  const [userRoleRater, setUserRoleRater] = useState(false);
  const [userRoleStudent, setUserRoleStudent] = useState(false);
  const [userRoleDev, setUserRoleDev] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
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

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase.rpc('get_user_role_by_user_id', {
      id: userId,
    });

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data as string | null;
  };

  const fetchUser = useCallback(async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
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

  useEffect(() => {
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
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

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
