export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER',
  CUSTOMER = 'CUSTOMER'
}

export interface UserPermissions {
  canViewInvoices: boolean;
  canCreateInvoices: boolean;
  canEditInvoices: boolean;
  canDeleteInvoices: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canProcessPayments: boolean;
  canViewAuditLogs: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: UserPermissions;
  is2FAEnabled: boolean;
  lastLogin?: Date;
  lastLoginIP?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  is2FAPending: boolean;
  loading: boolean;
  error: string | null;
}
