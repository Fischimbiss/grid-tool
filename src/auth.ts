export type AppUser = { id: number; name: string; roles: string[] }

export const currentUser: AppUser = { id: 1, name: 'Demo Admin', roles: ['Admin'] }

export function hasRole(role: string): boolean {
  return currentUser.roles.includes(role)
}
