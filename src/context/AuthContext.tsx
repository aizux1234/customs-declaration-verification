// src/context/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, type LoginResult } from '../api/authApi';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  signIn: (username: string, password: string) => Promise<LoginResult>;
  signOut: () => Promise<void>;
  switchRole: (user: User) => void;   // demo helper
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function signIn(username: string, password: string): Promise<LoginResult> {
    const result = await apiLogin(username, password);
    if (result.ok) setUser(result.user);
    return result;
  }
  async function signOut(): Promise<void> {
    if (user) await apiLogout(user);
    setUser(null);
  }
  function switchRole(next: User): void { setUser(next); }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
