import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export type RouteComponent = LazyExoticComponent<ComponentType<Record<string, never>>>;

export type ProtectedRouteConfig = {
  path: string;
  Component: RouteComponent;
  permission?: string;
  role?: string;
};

export const protectedRoutes: ProtectedRouteConfig[] = [
  { path: '/', Component: lazy(() => import('./pages/Dashboard')) },
  {
    path: '/system/user',
    Component: lazy(() => import('./pages/UserManagement')),
    permission: 'system:user:list',
  },
  {
    path: '/system/role',
    Component: lazy(() => import('./pages/RoleManagement')),
    permission: 'system:role:list',
  },
  {
    path: '/system/permission',
    Component: lazy(() => import('./pages/PermissionManagement')),
    permission: 'system:permission:list',
  },
  {
    path: '/system/audit',
    Component: lazy(() => import('./pages/AuditLogs')),
    permission: 'system:audit:list',
  },
  {
    path: '/system/menu',
    Component: lazy(() => import('./pages/MenuManagement')),
    permission: 'system:menu:list',
  },
  {
    path: '/system/customer',
    Component: lazy(() => import('./pages/CustomerManagement')),
    permission: 'system:customer:list',
  },
  {
    path: '/services/order',
    Component: lazy(() => import('./pages/OrderManagement')),
    permission: 'service:order:list',
  },
  {
    path: '/services/hall',
    Component: lazy(() => import('./pages/ServiceHall')),
    permission: 'service:hall:view',
  },
  {
    path: '/services/project',
    Component: lazy(() => import('./pages/ProjectManagement')),
    permission: 'service:project:list',
  },
  {
    path: '/services/category',
    Component: lazy(() => import('./pages/ProjectCategory')),
    permission: 'service:category:list',
  },
  { path: '/services/visual-dashboard', Component: lazy(() => import('./pages/VisualDashboard')) },
];
