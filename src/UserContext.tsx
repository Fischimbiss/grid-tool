import React, { createContext, useContext, useEffect, useState } from 'react';
import authService, { Group, Role, User } from './auth/authService';

interface UserContextType {
  user: User | null;
  roles: Role[];
  groups: Group[];
  activeRole: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveRole: (roleId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeRole, setActiveRoleState] = useState<string | null>(() =>
    localStorage.getItem('activeRole')
  );

  useEffect(() => {
    authService.getSession().then((sessionUser) => {
      if (sessionUser) {
        setUser(sessionUser);
        setRoles(sessionUser.roles);
        setGroups(sessionUser.groups);
      }
    });
  }, []);

  const login = async (username: string, password: string) => {
    const sessionUser = await authService.login(username, password);
    setUser(sessionUser);
    setRoles(sessionUser.roles);
    setGroups(sessionUser.groups);
    if (sessionUser.roles.length > 0) {
      setActiveRole(sessionUser.roles[0].id);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setRoles([]);
    setGroups([]);
    setActiveRoleState(null);
    localStorage.removeItem('activeRole');
  };

  const setActiveRole = (roleId: string) => {
    setActiveRoleState(roleId);
    localStorage.setItem('activeRole', roleId);
  };

  return (
    <UserContext.Provider
      value={{ user, roles, groups, activeRole, login, logout, setActiveRole }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export { UserContext };
