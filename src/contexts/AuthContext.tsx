import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('khaskins_user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleSetUser = (u: User | null) => {
    setUser(u);
    if (u) sessionStorage.setItem('khaskins_user', JSON.stringify(u));
    else sessionStorage.removeItem('khaskins_user');
  };

  const logout = () => handleSetUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, isAuthenticated: !!user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
