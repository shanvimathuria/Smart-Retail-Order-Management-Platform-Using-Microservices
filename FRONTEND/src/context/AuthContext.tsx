import React, { createContext, useContext, useState } from 'react';
import type { AuthContextType, SignupFormData, User } from '../types';
import { loginUser, registerUser } from '../services/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'auth_user';
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_TOKEN_TYPE_KEY = 'auth_token_type';

const readAuthSession = (): { user: User | null; token: string | null; tokenType: string | null } => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, tokenType: null };
  }

  const storedUser = localStorage.getItem(AUTH_USER_KEY);
  const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const storedTokenType = localStorage.getItem(AUTH_TOKEN_TYPE_KEY);

  if (!storedUser || !storedToken) {
    return { user: null, token: null, tokenType: null };
  }

  try {
    return {
      user: JSON.parse(storedUser) as User,
      token: storedToken,
      tokenType: storedTokenType ?? 'Bearer',
    };
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
    return { user: null, token: null, tokenType: null };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialSession] = useState(readAuthSession);
  const [user, setUser] = useState<User | null>(initialSession.user);
  const [token, setToken] = useState<string | null>(initialSession.token);
  const [tokenType, setTokenType] = useState<string | null>(initialSession.tokenType);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialSession.user && initialSession.token));
  const [isAuthLoading] = useState(false);

  const persistSession = (nextUser: User, nextToken: string, nextTokenType: string) => {
    const normalizedTokenType = (nextTokenType || 'Bearer').trim();
    const safeTokenType = normalizedTokenType.toLowerCase() === 'bearer' ? 'Bearer' : normalizedTokenType;

    setUser(nextUser);
    setToken(nextToken);
    setTokenType(safeTokenType);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    localStorage.setItem(AUTH_TOKEN_TYPE_KEY, safeTokenType);
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

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update user data
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      tokenType,
      login,
      signup,
      logout,
      updateProfile,
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