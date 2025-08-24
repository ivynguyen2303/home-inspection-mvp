import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from './AuthProvider';
import { Role } from './types';

interface RoleRouteProps {
  children: React.ReactNode;
  role: Role;
}

export function RoleRoute({ children, role }: RoleRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setLocation('/login');
      } else if (user.role !== role) {
        setLocation('/forbidden');
      }
    }
  }, [user, loading, role, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== role) {
    return null; // Will redirect
  }

  return <>{children}</>;
}