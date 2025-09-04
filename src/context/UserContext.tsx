import { createContext, useContext, useState, ReactNode } from 'react'

export type UserRole = 'FSysV' | 'BR'

interface UserContextType {
  userName: string
  group: string
  role: UserRole
  setRole: (r: UserRole) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('FSysV')
  const value: UserContextType = {
    userName: 'Max Mustermann',
    group: 'Sales',
    role,
    setRole,
  }
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within a UserProvider')
  return ctx
}
