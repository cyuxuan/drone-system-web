import React, { useEffect, useMemo, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Info, Loader2 } from 'lucide-react';
import { useAppContext } from '../context';
import EmptyState from './EmptyState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, permission, role }) => {
  const { user, isLoading, hasPermission, hasRole, menus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showMessage, language, t } = useAppContext();
  const lastDeniedPathRef = useRef<string | null>(null);

  const inferredPermission = useMemo(() => {
    const isPathActive = (path: string, currentPath: string) => {
      if (!path) return false;
      if (path === '/') return currentPath === '/';
      return currentPath === path || currentPath.startsWith(path + '/');
    };

    const flattened: Array<{ path: string; permission?: string }> = [];
    const walk = (items: typeof menus) => {
      items.forEach((item) => {
        flattened.push({
          path: item.path,
          permission: item.permission,
        });

        if (item.children && item.children.length > 0) {
          walk(item.children);
        }
      });
    };

    walk(menus);

    let best: { path: string; permission?: string } | null = null;
    for (const item of flattened) {
      if (!item.path) continue;
      if (!isPathActive(item.path, location.pathname)) continue;
      if (!best || item.path.length > best.path.length) best = item;
    }
    return best?.permission;
  }, [location.pathname, menus]);

  const requiredPermission = permission || inferredPermission;
  const hasAccess = useMemo(() => {
    if (requiredPermission && !hasPermission(requiredPermission)) return false;
    if (role && !hasRole(role)) return false;
    return true;
  }, [hasPermission, hasRole, requiredPermission, role]);

  useEffect(() => {
    if (isLoading || !user) return;
    if (hasAccess) return;
    if (lastDeniedPathRef.current === location.pathname) return;

    lastDeniedPathRef.current = location.pathname;
    showMessage({
      type: 'error',
      title: t('error'),
      message:
        language === 'zh'
          ? '无权限访问该页面，请联系管理员开通权限。'
          : 'No permission to access this page.',
    });
  }, [hasAccess, isLoading, language, location.pathname, showMessage, t, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    return (
      <EmptyState
        icon={Info}
        title={language === 'zh' ? '无权限' : 'NO PERMISSION'}
        description={
          language === 'zh'
            ? '当前账号无权限访问该页面，请联系管理员开通权限。'
            : 'Your account does not have permission to access this page.'
        }
        actionLabel={t('returnPrevious')}
        onAction={() => navigate(-1)}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
