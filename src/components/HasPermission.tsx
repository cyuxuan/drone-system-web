import React from 'react';
import { useAuth } from '../context/AuthContext';

interface HasPermissionProps {
  permission?: string;
  role?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const HasPermission: React.FC<HasPermissionProps> = ({
  permission,
  role,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasRole } = useAuth();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  }

  if (role && hasAccess) {
    hasAccess = hasRole(role);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default HasPermission;
