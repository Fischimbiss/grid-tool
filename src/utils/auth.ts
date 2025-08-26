export type User = {
  roles: string[];
  permissions: string[];
};

// TODO: replace with real user context or auth provider
const currentUser: User = {
  roles: [],
  permissions: [],
};

export const setUser = (user: Partial<User>) => {
  if (user.roles) currentUser.roles = user.roles;
  if (user.permissions) currentUser.permissions = user.permissions;
};

export const hasRole = (role: string): boolean => {
  return currentUser.roles.includes(role);
};

export const hasPermission = (permission: string): boolean => {
  return currentUser.permissions.includes(permission);
};
