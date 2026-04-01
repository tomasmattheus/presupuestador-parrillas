import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getUsers } from '../services/settings.service';
import { pullFromCloud } from '../services/sync.service';

interface AuthContextValue {
  user: string | null;
  isLoggedIn: boolean;
  syncing: boolean;
  login: (user: string, pw: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  syncing: false,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(
    () => sessionStorage.getItem('qd_user')
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => sessionStorage.getItem('qd_logged_in') === 'true'
  );
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      setSyncing(true);
      pullFromCloud().finally(() => setSyncing(false));
    }
  }, [isLoggedIn]);

  const login = useCallback((username: string, password: string): boolean => {
    const users = getUsers();
    if (users[username] && users[username] === password) {
      sessionStorage.setItem('qd_logged_in', 'true');
      sessionStorage.setItem('qd_user', username);
      setUser(username);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('qd_logged_in');
    sessionStorage.removeItem('qd_user');
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, syncing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
