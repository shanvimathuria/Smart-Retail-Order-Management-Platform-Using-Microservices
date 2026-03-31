import React, { createContext, useContext, useState } from 'react';

interface AdminContextType {
  adminUser: AdminUser | null;
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;
  adminLogin: (id: string, password: string) => Promise<void>;
  adminLogout: () => void;
}

interface AdminUser {
  id: string;
  name: string;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_USER_KEY = 'admin_user';
const ADMIN_TOKEN_KEY = 'admin_token';

const readAdminSession = (): { user: AdminUser | null; token: string | null } => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }

  const storedAdminUser = localStorage.getItem(ADMIN_USER_KEY);
  const storedAdminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (!storedAdminUser || !storedAdminToken) {
    return { user: null, token: null };
  }

  try {
    return {
      user: JSON.parse(storedAdminUser) as AdminUser,
      token: storedAdminToken,
    };
  } catch {
    localStorage.removeItem(ADMIN_USER_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return { user: null, token: null };
  }
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialSession] = useState(readAdminSession);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(initialSession.user);
  const [adminToken, setAdminToken] = useState<string | null>(initialSession.token);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(Boolean(initialSession.user && initialSession.token));
  const [isAdminLoading] = useState(false);

  const adminLogin = async (id: string, password: string): Promise<void> => {
    // Hard-coded credentials for demo: ID=admin, Password=admin123
    if (id === 'admin' && password === 'admin123') {
      const user: AdminUser = {
        id: 'admin',
        name: 'Administrator'
      };
      const token = 'admin-token-' + Date.now();

      setAdminUser(user);
      setAdminToken(token);
      setIsAdminAuthenticated(true);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      throw new Error('Invalid admin credentials');
    }
  };

  const adminLogout = () => {
    setAdminUser(null);
    setAdminToken(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem(ADMIN_USER_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        adminToken,
        isAdminAuthenticated,
        isAdminLoading,
        adminLogin,
        adminLogout
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
