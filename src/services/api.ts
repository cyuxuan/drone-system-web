import {
  User,
  Role,
  DroneOrder,
  DroneProject,
  ProjectType,
  AuditLog,
  TelemetryData,
  MenuItem,
  Customer,
  UserRole,
  BackendOrder,
  Permission,
  Menu,
} from '../types';
interface BackendSysUser {
  id: number;
  userId: string;
  username: string;
  email: string;
  phone?: string;
  nickname?: string;
  userType?: string;
  identity?: string;
  source?: string;
  loginType?: string;
  status: number;
  lastLoginTime?: string;
  lastLoginIp?: string;
  createTime: string;
}
import { httpClient, ApiResponse, PageData } from './httpClient';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const api = {
  // --- Dashboard Data ---
  getDashboardStats: async () => {
    await delay(800);
    return {
      weeklyOrders: 1284,
      totalRevenue: 42500,
      activePilots: 48,
      onlineUsers: 3942,
      orderTrends: [
        { name: 'Mon', orders: 45, revenue: 12000 },
        { name: 'Tue', orders: 52, revenue: 15000 },
        { name: 'Wed', orders: 48, revenue: 14000 },
        { name: 'Thu', orders: 61, revenue: 18000 },
        { name: 'Fri', orders: 55, revenue: 16500 },
        { name: 'Sat', orders: 67, revenue: 21000 },
        { name: 'Sun', orders: 72, revenue: 25000 },
      ],
      userSources: [
        { name: 'App Store', value: 400 },
        { name: 'Website', value: 300 },
        { name: 'Corporate', value: 300 },
        { name: 'Social', value: 200 },
      ],
      liveFeed: [
        {
          id: 1,
          type: 'command',
          message: 'Mission #A203: Automated crop spraying initiated in Sector G7.',
          time: 'Just now',
          icon: 'zap',
        },
        {
          id: 2,
          type: 'alert',
          message: 'Warning: Low signal strength detected at Asia-East Relay Node.',
          time: '2 min ago',
          icon: 'alert-triangle',
        },
        {
          id: 3,
          type: 'success',
          message: 'Order #ORD-2201 completed successfully by Pilot Jason.',
          time: '15 min ago',
          icon: 'check-circle',
        },
        {
          id: 4,
          type: 'info',
          message: 'System Update: Fleet FW v2.5.1 deployed to all Alpha units.',
          time: '1 hour ago',
          icon: 'info',
        },
      ],
      systemHealth: [
        { name: 'North America', status: 'online', load: 45 },
        { name: 'Europe', status: 'online', load: 62 },
        { name: 'Asia Pacific', status: 'online', load: 88 },
        { name: 'South America', status: 'maintenance', load: 0 },
      ],
    };
  },

  // --- Users ---
  getUsers: async (
    pageNum: number = 1,
    pageSize: number = 10,
  ): Promise<{ users: User[]; total: number }> => {
    const res = await httpClient.get<ApiResponse<PageData<BackendSysUser>>>(
      `/admin/user/list?pageNum=${pageNum}&pageSize=${pageSize}`,
    );

    if (!res.data) {
      return { users: [], total: 0 };
    }

    const users = (res.data.list || []).map((u) => ({
      id: u.id,
      userId: u.userId,
      username: u.username,
      email: u.email,
      phone: u.phone,
      nickname: u.nickname,
      userType: u.userType,
      identity: u.identity,
      source: u.source,
      loginType: u.loginType,
      role: UserRole.ADMIN, // Default to ADMIN as backend doesn't store roles yet
      status: u.status,
      lastLoginTime: u.lastLoginTime,
      lastLoginIp: u.lastLoginIp,
      createTime: u.createTime,
    }));

    return {
      users,
      total: res.data.total || 0,
    };
  },
  saveUser: async (user: Partial<User>) => {
    const payload: Partial<BackendSysUser> & { passwordHash?: string } = {
      id: user.id,
      userId: user.userId,
      username: user.username,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      userType: user.userType,
      identity: user.identity,
      status: user.status ?? 0,
      // For add, we might need a default password if not provided
      passwordHash: (user as { password?: string }).password || '123456',
    };

    if (user.id) {
      await httpClient.post<ApiResponse<void>>('/admin/user/update', payload);
    } else {
      await httpClient.post<ApiResponse<void>>('/admin/user/add', payload);
    }
    return true;
  },
  deleteUser: async (id: number) => {
    await httpClient.post<ApiResponse<void>>(`/admin/user/delete?id=${id}`);
    return true;
  },
  updateUserStatus: async (id: number, status: number) => {
    await httpClient.post<ApiResponse<void>>(`/admin/user/status?id=${id}&status=${status}`);
    return true;
  },

  // --- Roles ---
  getRoles: async () => {
    const res = await httpClient.get<ApiResponse<Role[]>>('/admin/role/list');
    return res.data || [];
  },
  saveRole: async (role: Partial<Role>) => {
    const isUpdate = !!role.id || !!role.roleId;
    const endpoint = isUpdate ? '/admin/role/update' : '/admin/role/add';
    const payload = isUpdate
      ? {
          roleId: role.roleId || (role.id as string),
          roleName: role.name ?? role.roleName,
          roleCode: role.roleCode,
          description: role.description,
          permissions: role.permissions || [],
          isActive: role.isActive,
          isSystem: role.isSystem,
        }
      : {
          roleName: role.name || '',
          roleCode: role.roleCode || role.name?.toUpperCase().replace(/\s+/g, '_'),
          description: role.description,
          permissions: role.permissions || [],
        };
    await httpClient.post<ApiResponse<void>>(endpoint, payload);
    return true;
  },
  deleteRole: async (id: string) => {
    await httpClient.post<ApiResponse<void>>(`/admin/role/delete?roleId=${id}`);
    return true;
  },
  getUsersByRole: async (roleCode: string) => {
    const res = await httpClient.get<ApiResponse<User[]>>(`/admin/role/users?roleCode=${roleCode}`);
    return res.data || [];
  },

  // --- Menu ---
  getMenu: async (): Promise<MenuItem[]> => {
    const res = await httpClient.get<ApiResponse<Menu[]>>('/admin/menu/user/tree');
    if (!res.data) return [];

    const mapMenuToItem = (menu: Menu): MenuItem => ({
      id: menu.menuId || String(menu.id ?? ''),
      label: menu.menuName,
      path: menu.path || '',
      icon: menu.icon || 'LayoutDashboard',
      parentId: menu.parentId,
      permission: menu.menuCode,
      children: menu.children?.map(mapMenuToItem),
    });

    return res.data.map(mapMenuToItem);
  },
  saveMenuItem: async (item: Partial<MenuItem>) => {
    const isUpdate = !!item.id;
    const endpoint = isUpdate ? '/admin/menu/update' : '/admin/menu/add';

    // Map MenuItem back to Menu for backend
    const payload = {
      id: item.id,
      menuName: item.label,
      path: item.path,
      icon: item.icon,
      parentId: item.parentId,
      menuCode: item.permission,
    };

    await httpClient.post<ApiResponse<void>>(endpoint, payload);
    return true;
  },
  deleteMenuItem: async (id: string) => {
    await httpClient.post<ApiResponse<void>>(`/admin/menu/delete?id=${id}`);
    return true;
  },

  // --- Projects ---
  getProjects: async (): Promise<DroneProject[]> => {
    const res = await httpClient.get<ApiResponse<DroneProject[]>>('/admin/service-project/list');
    return res.data || [];
  },
  saveProject: async (project: Partial<DroneProject>) => {
    await httpClient.post<ApiResponse<void>>('/admin/service-project/save', project);
    return true;
  },
  deleteProject: async (projectNo: string) => {
    await httpClient.delete<ApiResponse<void>>(
      `/admin/service-project/delete?projectNo=${projectNo}`,
    );
    return true;
  },

  // --- Project Types ---
  getProjectTypes: async () => {
    const res = await httpClient.get<ApiResponse<ProjectType[]>>('/admin/service-type/list');
    return res.data || [];
  },
  saveProjectType: async (type: Partial<ProjectType>) => {
    await httpClient.post<ApiResponse<void>>('/admin/service-type/save', type);
    return true;
  },
  deleteProjectType: async (typeNo: string) => {
    await httpClient.delete<ApiResponse<void>>(`/admin/service-type/delete?typeNo=${typeNo}`);
    return true;
  },

  // --- Orders ---
  getOrders: async (params?: {
    page?: number;
    pageSize?: number;
    status?: number;
    keyword?: string;
  }): Promise<{ list: DroneOrder[]; total: number }> => {
    const res = await httpClient.get<ApiResponse<{ list: BackendOrder[]; total: number }>>(
      '/admin/order/all',
      {
        params,
      },
    );
    const data = res.data;
    return {
      list: (data?.list || []).map(
        (o: BackendOrder): DroneOrder => ({
          ...o,
          orderNumber: o.planNo,
          projectName: o.serviceProjectName || 'Standard Mission',
          clientName: o.userId,
          amount: o.budgetAmount,
          date: o.createTime ? o.createTime.split('T')[0] : '',
          location: o.departurePlace,
          phone: o.phone,
        }),
      ),
      total: data?.total || 0,
    };
  },
  saveOrder: async (order: Partial<DroneOrder>) => {
    if (order.id) {
      // For updates, we use the new /order/update endpoint
      await httpClient.post<ApiResponse<void>>('/order/update', order);
    } else {
      // For creation, we might need a specific mapping for PlanInfoDTO
      // But for now, let's assume the backend can handle the Partial<DroneOrder> or we map it
      const planInfo = {
        budgetAmount: order.budgetAmount || order.amount,
        desiredStartTime:
          order.desiredStartTime || new Date().toISOString().replace('T', ' ').substring(0, 16),
        workPlace: order.departurePlace || order.location,
        serviceTypeNo: order.serviceTypeNo || 'ST-001', // Default or from form
        serviceProjectNo: order.serviceTypeNo || 'SP-001',
        serviceProjectName: order.projectName,
        departureLng: 116.4, // Mocked or from form
        departureLat: 39.9,
        remarks: order.remarks,
      };
      await httpClient.post<ApiResponse<string>>('/order/create-plan', planInfo);
    }
    return true;
  },
  deleteOrder: async (planNo: string) => {
    await httpClient.delete<ApiResponse<void>>(`/order/delete?planNo=${planNo}`);
    return true;
  },

  // --- Logs ---
  getLogs: async (pageNum: number = 1, pageSize: number = 10) => {
    const response = await httpClient.get<ApiResponse<PageData<AuditLog>>>(
      `/admin/audit/list?pageNum=${pageNum}&pageSize=${pageSize}`,
    );
    return response.data;
  },

  // --- Telemetry ---
  getLiveTelemetry: async (): Promise<TelemetryData[]> => {
    await delay(200);
    return [
      {
        id: 'D1',
        droneName: 'SkyEye-Alpha',
        pilot: 'Jason',
        lat: 34.0522 + (Math.random() - 0.5) * 0.01,
        lng: -118.2437 + (Math.random() - 0.5) * 0.01,
        alt: 120 + (Math.random() - 0.5) * 10,
        battery: 85,
        speed: 45,
        status: 'flying',
      },
      {
        id: 'D2',
        droneName: 'AgriSwift-04',
        pilot: 'Sarah',
        lat: 34.0622 + (Math.random() - 0.5) * 0.01,
        lng: -118.2537 + (Math.random() - 0.5) * 0.01,
        alt: 45 + (Math.random() - 0.5) * 5,
        battery: 42,
        speed: 12,
        status: 'flying',
      },
      {
        id: 'D3',
        droneName: 'HeavyLifter-V2',
        pilot: 'None',
        lat: 34.0422,
        lng: -118.2337,
        alt: 0,
        battery: 100,
        speed: 0,
        status: 'idling',
      },
    ];
  },

  // --- Customers ---
  getCustomers: async (pageNum: number = 1, pageSize: number = 10, keyword?: string) => {
    // 后端目前只有 list 接口，暂不支持分页，先模拟分页结构
    const res = await httpClient.get<ApiResponse<Customer[]>>(
      `/admin/customer/list${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`,
    );
    const allData = res.data;
    const pageData: PageData<Customer> = {
      list: allData.slice((pageNum - 1) * pageSize, pageNum * pageSize),
      total: allData.length,
      pageNum,
      pageSize,
      pages: Math.ceil(allData.length / pageSize),
    };
    return pageData;
  },
  saveCustomer: async (customer: Partial<Customer>) => {
    await httpClient.post<ApiResponse<void>>('/customer/save', customer);
    return true;
  },
  deleteCustomer: async (customerNo: string) => {
    await httpClient.delete<ApiResponse<void>>(`/customer/delete?customerNo=${customerNo}`);
    return true;
  },
  updateCustomerStatus: async (customerNo: string, status: number) => {
    await httpClient.post<ApiResponse<void>>(
      `/admin/customer/status?customerNo=${customerNo}&status=${status}`,
    );
    return true;
  },

  // --- Permission Management ---
  getPermissions: async () => {
    const res = await httpClient.get<ApiResponse<Permission[]>>('/admin/permission/list');
    return res.data || [];
  },
  savePermission: async (permission: Partial<Permission>) => {
    const isUpdate = !!permission.id;
    const endpoint = isUpdate ? '/admin/permission/update' : '/admin/permission/create';
    await httpClient.post<ApiResponse<void>>(endpoint, permission);
    return true;
  },
  deletePermission: async (id: string) => {
    await httpClient.delete<ApiResponse<void>>(`/admin/permission/delete/${id}`);
    return true;
  },
};
