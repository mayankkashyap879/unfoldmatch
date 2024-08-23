'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  email: string;
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for token in localStorage and validate it
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and set user
      // This is where you'd typically make an API call to validate the token
      // and get the user data
      setUser({ id: '1', email: 'user@example.com' }); // Replace with actual user data
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    // Set user data based on the token
    setUser({ id: '1', email: 'user@example.com' }); // Replace with actual user data
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}