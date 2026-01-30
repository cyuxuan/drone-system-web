import { User, Role, MenuItem, DroneOrder } from './types';

export const INITIAL_USERS: User[] = [];

export const INITIAL_ROLES: Role[] = [];

export const INITIAL_MENU: MenuItem[] = [
  { id: '1', label: 'dashboard', path: '/', icon: 'LayoutDashboard' },
  { id: '2', label: 'systemAdmin', path: '/system', icon: 'Settings' },
  {
    id: '2.1',
    label: 'userMgmt',
    path: '/system/users',
    icon: 'Users',
    parentId: '2',
    permission: 'system:user:list',
  },
  {
    id: '2.2',
    label: 'roleMgmt',
    path: '/system/roles',
    icon: 'ShieldCheck',
    parentId: '2',
    permission: 'system:role:list',
  },
  {
    id: '2.6',
    label: 'permissionMgmt',
    path: '/system/permissions',
    icon: 'Key',
    parentId: '2',
    permission: 'system:permission:list',
  },
  {
    id: '2.4',
    label: 'auditLogs',
    path: '/system/logs',
    icon: 'History',
    parentId: '2',
    permission: 'system:audit:list',
  },
  {
    id: '2.3',
    label: 'menuMgmt',
    path: '/system/menu',
    icon: 'MenuIcon',
    parentId: '2',
    permission: 'system:menu:list',
  },
  {
    id: '2.5',
    label: 'customerMgmt',
    path: '/system/customers',
    icon: 'Users',
    parentId: '2',
    permission: 'system:customer:list',
  },
  { id: '3', label: 'droneServices', path: '/services', icon: 'Plane' },
  {
    id: '3.5',
    label: 'serviceHall',
    path: '/services/hall',
    icon: 'Store',
    parentId: '3',
    permission: 'service:hall:view',
  },
  {
    id: '3.1',
    label: 'orderMgmt',
    path: '/services/orders',
    icon: 'ClipboardList',
    parentId: '3',
    permission: 'service:order:list',
  },
  {
    id: '3.3',
    label: 'visualDashboard',
    path: '/services/visual-dashboard',
    icon: 'Radar',
    parentId: '3',
  },
  {
    id: '3.2',
    label: 'projectCatalog',
    path: '/services/projects',
    icon: 'Package',
    parentId: '3',
    permission: 'service:project:list',
  },
  {
    id: '3.4',
    label: 'projectCategoryMgmt',
    path: '/services/categories',
    icon: 'Settings',
    parentId: '3',
    permission: 'service:category:list',
  },
];

export const INITIAL_ORDERS: DroneOrder[] = [];
