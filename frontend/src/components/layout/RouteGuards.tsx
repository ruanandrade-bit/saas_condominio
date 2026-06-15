import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner text="Carregando..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner text="Carregando..." />;
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/morador'} replace />;
  }
  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <LoadingSpinner text="Carregando..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/morador" replace />;
  return <>{children}</>;
};

export const ResidentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isResident } = useAuth();
  if (loading) return <LoadingSpinner text="Carregando..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isResident) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
