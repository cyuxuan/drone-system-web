export enum OrderStatus {
  PENDING = 0,
  SCHEDULED = 1,
  IN_PROGRESS = 2,
  CANCELLED = 3,
  COMPLETED = 4,
}

export enum UserRole {
  ADMIN = 'Admin',
  DISPATCHER = 'Dispatcher',
  PILOT = 'Pilot',
  CLIENT = 'Client',
}

export interface User {
  id: number;
  userId: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: number; // 0-正常, 1-禁用, 3-已删除
  createTime: string;
}

export interface Role {
  id: string; // roleId from backend
  roleId?: string; // 后端字段
  name: string; // roleName from backend
  roleName?: string; // 后端字段
  roleCode?: string; // 后端字段
  description: string;
  permissions: string[];
  isSystem?: boolean;
  isActive?: boolean;
  createTime?: string;
  updateTime?: string;
}

export interface MenuAction {
  key: string;
  label: string;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  parentId?: string;
  actions?: MenuAction[];
  children?: MenuItem[];
}

export interface DroneOrder {
  id: number;
  planNo: string;
  orderNumber?: string; // Alias for planNo for compatibility
  projectName: string;
  clientName: string;
  userId: string;
  pilotId?: string;
  pilotName?: string;
  amount: number;
  budgetAmount: number;
  status: OrderStatus;
  date: string;
  createTime: string;
  desiredStartTime: string;
  location?: string;
  departurePlace: string;
  remarks?: string;
  serviceTypeNo?: string;
  phone?: string;
}

export interface BackendOrder {
  id: number;
  planNo: string;
  userId: string;
  budgetAmount: number;
  status: number;
  createTime: string;
  desiredStartTime: string;
  departurePlace: string;
  serviceTypeNo?: string;
  remarks?: string;
  serviceProjectName?: string;
  phone?: string;
}

export interface DroneProject {
  id: number;
  projectNo: string;
  typeNo: string;
  projectName: string;
  projectCode: string;
  unit: string;
  projectPrice: number;
  description: string;
  isActive: number; // 1 for active, 0 for inactive
  createTime: string;
  updateTime: string;
}

export interface ProjectType {
  id?: number;
  typeNo: string;
  name: string;
  code: string;
  category: number; // smallint in backend
  description: string;
  isActive: number; // 1 active, 0 inactive
  createTime?: string;
  updateTime?: string;
}

export interface AuditLog {
  id: number;
  username: string;
  userId?: string;
  module: string;
  operation: string;
  method: string;
  params: string;
  result?: string;
  executionTime: number;
  status: number; // 0: failure, 1: success
  errorMsg?: string;
  ip: string;
  userAgent: string;
  createTime: string;
}

export interface TelemetryData {
  id: string;
  droneName: string;
  pilot: string;
  lat: number;
  lng: number;
  alt: number;
  battery: number;
  speed: number;
  status: 'flying' | 'idling' | 'returning';
}

export type CustomerSource = 'WECHAT' | 'DOUYIN' | 'ALIPAY' | 'MINIAPP';

export interface Customer {
  id: number;
  userId: string;
  customerNo: string;
  phone: string;
  nickname?: string;
  avatarUrl?: string;
  source: CustomerSource;
  loginType?: string;
  lastLoginTime?: string;
  lastLoginIp?: string;
  registerIp?: string;
  status: number; // 0: 正常, 1: 禁用
  totalOrders: number;
  totalSpent?: number;
  registerTime: string;
  createTime: string;
  updateTime: string;
}

export interface DashboardStats {
  weeklyOrders: number;
  totalRevenue: number;
  activePilots: number;
  onlineUsers: number;
  orderTrends: Array<{ name: string; orders: number; revenue: number }>;
  userSources: Array<{ name: string; value: number }>;
  liveFeed: Array<{ id: number; type: string; message: string; time: string; icon: string }>;
  systemHealth: Array<{ name: string; status: string; load: number }>;
}
