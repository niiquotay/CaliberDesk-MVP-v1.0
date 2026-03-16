import React from 'react';
import { UserProfile } from '../types';

interface ProtectedRouteProps {
  user: UserProfile;
  isAuthenticated: boolean;
  requiredRole?: 'admin' | 'employer' | 'seeker';
  children: React.ReactNode;
  fallback: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  user, 
  isAuthenticated, 
  requiredRole, 
  children, 
  fallback 
}) => {
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (requiredRole === 'admin') {
    const isAdmin = user.isAdmin || !!user.opRole;
    if (!isAdmin) {
      return <>{fallback}</>;
    }
  }

  if (requiredRole === 'employer' && !user.isEmployer && !user.isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
