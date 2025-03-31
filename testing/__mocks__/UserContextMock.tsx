import { ReactNode } from 'react';
import { UserContext } from '../../frontend/src/context/UserContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockUserContext = (value: any) => {
  const MockUserProvider = ({ children }: { children: ReactNode }) => (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
  MockUserProvider.displayName = 'MockUserProvider';
  return MockUserProvider;
};
