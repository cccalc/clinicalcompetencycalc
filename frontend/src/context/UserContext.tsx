'use client';

import { supabase_authorize } from '@/utils/async-util';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface User {
  id: string;
  email: string;
  display_name: string;
}
interface UserContextType {
  user: User | null;
  userRoleAuthorized: boolean;
  userRoleRater: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRoleAuthorized, setUserRoleAuthorized] = useState(false);
  const [userRoleRater, setUserRoleRater] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      if (data?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        setUser({
          id: data.user.id,
          email: data.user.email ?? '',
          display_name: profileData.display_name,
        });

        supabase_authorize(['user_roles.select', 'user_roles.insert']).then((result) => {
          setUserRoleAuthorized(result);
        });

        supabase_authorize(['form_responses.select', 'form_responses.insert']).then((result) => {
          setUserRoleRater(result);
        });
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <UserContext.Provider value={{ user, userRoleAuthorized, userRoleRater }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
