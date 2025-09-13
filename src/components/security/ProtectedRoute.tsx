import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSecurity } from '../../contexts/SecurityContext';
import { UserRole } from '../../types/security';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  redirectTo = '/login',
}) => {
  const { state, hasPermission, hasRole } = useSecurity();
  const location = useLocation();

  // If not initialized yet, show loading state
  if (!state.isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!state.isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has required roles
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => hasRole(role));

  // Check if user has required permissions
  const hasRequiredPermissions = requiredPermissions.length === 0 ||
    requiredPermissions.every(permission => hasPermission(permission as any));

  // If user doesn't have required roles or permissions, redirect to unauthorized
  if (!hasRequiredRole || !hasRequiredPermissions) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If 2FA is enabled but not verified, redirect to 2FA verification
  if (state.user?.is2FAEnabled && !state.is2FAPending) {
    return <Navigate to="/verify-2fa" state={{ from: location }} replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
