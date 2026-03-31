import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAdminAuthenticated, isAdminLoading } = useAdmin();

  if (isAdminLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
