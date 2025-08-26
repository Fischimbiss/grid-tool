export interface Role {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  roles: Role[];
  groups: Group[];
}

const login = async (username: string, password: string): Promise<User> => {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new Error('Login failed');
  }
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data.user as User;
};

const logout = async (): Promise<void> => {
  await fetch('/api/logout', { method: 'POST' });
  localStorage.removeItem('token');
};

const getSession = async (): Promise<User | null> => {
  const res = await fetch('/api/session');
  if (!res.ok) {
    return null;
  }
  const data = await res.json();
  return data.user as User;
};

export const authService = {
  login,
  logout,
  getSession,
};

export default authService;
