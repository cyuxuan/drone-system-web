import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, MenuItem, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  roles: string[];
  permissions: string[];
  menus: MenuItem[];
  isLoading: boolean;
  login: (token: string, user: User, roles: string[], permissions: string[]) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshMenus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    try {
      const parsed = JSON.parse(storedUser) as Partial<User>;
      if (!parsed || typeof parsed !== 'object') return null;

      const roleCandidate = parsed.role as UserRole | undefined;
      const role = Object.values(UserRole).includes(roleCandidate as UserRole)
        ? (roleCandidate as UserRole)
        : UserRole.CLIENT;

      const normalized: User = {
        id: typeof parsed.id === 'number' ? parsed.id : 0,
        userId: typeof parsed.userId === 'string' ? parsed.userId : '',
        username:
          (typeof parsed.username === 'string' && parsed.username) ||
          (typeof parsed.nickname === 'string' && parsed.nickname) ||
          (typeof parsed.userId === 'string' && parsed.userId) ||
          '',
        email: typeof parsed.email === 'string' ? parsed.email : '',
        phone: typeof parsed.phone === 'string' ? parsed.phone : undefined,
        nickname: typeof parsed.nickname === 'string' ? parsed.nickname : undefined,
        userType: typeof parsed.userType === 'string' ? parsed.userType : undefined,
        identity: typeof parsed.identity === 'string' ? parsed.identity : undefined,
        source: typeof parsed.source === 'string' ? parsed.source : undefined,
        loginType: typeof parsed.loginType === 'string' ? parsed.loginType : undefined,
        role,
        status: typeof parsed.status === 'number' ? parsed.status : 0,
        lastLoginTime: typeof parsed.lastLoginTime === 'string' ? parsed.lastLoginTime : undefined,
        lastLoginIp: typeof parsed.lastLoginIp === 'string' ? parsed.lastLoginIp : undefined,
        createTime:
          typeof parsed.createTime === 'string' ? parsed.createTime : new Date().toISOString(),
      };

      if (!normalized.userId) return null;

      if (
        parsed.userId !== normalized.userId ||
        parsed.username !== normalized.username ||
        parsed.email !== normalized.email ||
        parsed.role !== normalized.role
      ) {
        localStorage.setItem('user', JSON.stringify(normalized));
      }

      return normalized;
    } catch {
      return null;
    }
  });
  const [roles, setRoles] = useState<string[]>(() => {
    const storedRoles = localStorage.getItem('roles');
    return storedRoles ? JSON.parse(storedRoles) : [];
  });
  const [permissions, setPermissions] = useState<string[]>(() => {
    const storedPermissions = localStorage.getItem('permissions');
    return storedPermissions ? JSON.parse(storedPermissions) : [];
  });
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenus = useCallback(async () => {
    try {
      const data = await api.getMenu();
      setMenus(data);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && user && menus.length === 0) {
        await fetchMenus();
      }
      setIsLoading(false);
    };

    void initializeAuth();
  }, [fetchMenus, user, menus.length]);

  const login = useCallback(
    (token: string, user: User, roles: string[], permissions: string[]) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('roles', JSON.stringify(roles));
      localStorage.setItem('permissions', JSON.stringify(permissions));
      setUser(user);
      setRoles(roles);
      setPermissions(permissions);
      fetchMenus();
    },
    [fetchMenus],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
    localStorage.removeItem('permissions');
    setUser(null);
    setRoles([]);
    setPermissions([]);
    setMenus([]);
  }, []);

  const hasPermission = useCallback(
    (permission: string) => {
      if (roles.includes('admin') || roles.includes('ADMIN')) return true;
      return permissions.includes(permission) || permissions.includes('*');
    },
    [roles, permissions],
  );

  const hasRole = useCallback(
    (role: string) => {
      return roles.includes(role);
    },
    [roles],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        menus,
        isLoading,
        login,
        logout,
        hasPermission,
        hasRole,
        refreshMenus: fetchMenus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
