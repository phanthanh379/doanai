import { createContext, useContext, useState, type ReactNode } from 'react';

// Fake in-app authentication with two roles (RQ3: role-based UI access).
// Admin additionally sees: Delete buttons, Settings page, Cost column.

export type Role = 'admin' | 'staff';

export interface Session {
  username: string;
  displayName: string;
  role: Role;
}

const USERS: Array<{ username: string; password: string; displayName: string; role: Role }> = [
  { username: 'admin', password: 'admin123', displayName: 'Alice Admin', role: 'admin' },
  { username: 'staff', password: 'staff123', displayName: 'Sam Staff', role: 'staff' },
];

const SESSION_KEY = 'shopmini.session';

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch {
    /* ignore */
  }
  return null;
}

interface AuthContextValue {
  session: Session | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);

  const login = (username: string, password: string): boolean => {
    const user = USERS.find((u) => u.username === username && u.password === password);
    if (!user) return false;
    const s: Session = { username: user.username, displayName: user.displayName, role: user.role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
