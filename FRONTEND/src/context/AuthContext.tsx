import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType, SignupFormData, User } from '../types';
import { loginUser, registerUser } from '../services/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'auth_user';
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_TOKEN_TYPE_KEY = 'auth_token_type';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedTokenType = localStorage.getItem(AUTH_TOKEN_TYPE_KEY);

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setTokenType(storedTokenType ?? 'Bearer');
      setIsAuthenticated(true);
    }

    setIsAuthLoading(false);
  }, []);

  const persistSession = (nextUser: User, nextToken: string, nextTokenType: string) => {
    setUser(nextUser);
    setToken(nextToken);
    setTokenType(nextTokenType);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    localStorage.setItem(AUTH_TOKEN_TYPE_KEY, nextTokenType);
  };

  const login = async (email: string, password: string): Promise<void> => {
    const session = await loginUser(email, password);
    persistSession(session.user, session.token, session.tokenType);
  };

  const signup = async (userData: SignupFormData): Promise<void> => {
    await registerUser(userData);
    const session = await loginUser(userData.email, userData.password);
    persistSession(session.user, session.token, session.tokenType);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTokenType(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      tokenType,
      login,
      signup,
      logout,
      isAuthenticated,
      isAuthLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};