'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { supabase_authorize } from '@/utils/async-util';

const supabase = createClient();

interface UserContextType {
  user: User | null;
  displayName: string;
  email: string;
  userRoleAuthorized: boolean;
  userRoleRater: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [userRoleAuthorized, setUserRoleAuthorized] = useState(false);
  const [userRoleRater, setUserRoleRater] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    return profileData.display_name;
  };

  const fetchUser = async () => {
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
      setLoading(false);
      return;
    }

    const user = session.user;
    setUser(user);
    setEmail(user.email ?? '');

    // Fetch display name from profiles table
    const fetchedDisplayName = await fetchUserProfile(user.id);
    setDisplayName(fetchedDisplayName ?? '');

    // Fetch user roles
    const authorized = await supabase_authorize(['user_roles.select', 'user_roles.insert']);
    setUserRoleAuthorized(authorized);

    const rater = await supabase_authorize(['form_responses.select', 'form_responses.insert']);
    setUserRoleRater(rater);

    setLoading(false);
  };

  useEffect(() => {
    fetchUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setDisplayName('');
        setEmail('');
        setUserRoleAuthorized(false);
        setUserRoleRater(false);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, displayName, email, userRoleAuthorized, userRoleRater, loading }}>
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
