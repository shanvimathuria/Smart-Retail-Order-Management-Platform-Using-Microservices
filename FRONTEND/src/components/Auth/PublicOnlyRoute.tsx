import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicOnlyRoute;