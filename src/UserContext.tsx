import { createContext } from 'react';

export type UserContextValue = {
  username: string;
  roles: string[];
  activeRole: string;
  setActiveRole: (role: string) => void;
  logout: () => void;
};

export const UserContext = createContext<UserContextValue>({
  username: '',
  roles: [],
  activeRole: '',
  setActiveRole: () => {},
  logout: () => {},
});
