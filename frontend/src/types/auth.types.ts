/**
 * Authentication Types
 * Type definitions for authentication system with multi-tenant role support
 */

/**
 * User role types for multi-tenant system
 */
export type UserRoleCode = 
  | 'platform_admin'    // Full platform access
  | 'entity_admin'      // Full tenant admin access
  | 'entity_staff'      // Operational access within tenant
  | 'organizer_admin';   // Limited to own events

/**
 * Role object structure returned by backend
 */
export interface Role {
  id: number;
  role_code: UserRoleCode;
  role_name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Organization/Entity information
 */
export interface Organization {
  id: number;
  name: string;
  slug?: string;
}

/**
 * User permissions for granular access control
 */
export type Permission = 
  | 'manage_users'
  | 'manage_categories'
  | 'manage_events'
  | 'approve_events'
  | 'manage_locations'
  | 'manage_organization'
  | 'view_analytics'
  | 'access_admin'
  // Event-specific permissions
  | 'events.create'
  | 'events.update'
  | 'events.delete'
  | 'events.feature'
  | 'events.approve';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  permissions?: Permission[];
  organization?: Organization;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;

  // Role & Permission Methods
  hasRole: (role: UserRoleCode) => boolean;
  canAccess: (resource: string) => boolean;
  getUserPermissions: () => Permission[];
  canManageEvents: () => boolean;
  canApproveEvents: () => boolean;
  canAccessAdmin: () => boolean;
  canManageUsers: () => boolean;
  canManageOrganization: () => boolean;
  canViewAnalytics: () => boolean;
}

export interface LoginFormState {
  email: string;
  password: string;
  error: string | null;
  isLoading: boolean;
  isFormValid: boolean;
}

export interface LoginFormActions {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  clearError: () => void;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;

  // Role & Permission Methods
  hasRole: (role: UserRoleCode) => boolean;
  canAccess: (resource: string) => boolean;
  getUserPermissions: () => Permission[];
  canManageEvents: () => boolean;
  canApproveEvents: () => boolean;
  canAccessAdmin: () => boolean;
  canManageUsers: () => boolean;
  canManageOrganization: () => boolean;
  canViewAnalytics: () => boolean;
}

/**
 * Role-based permission mapping
 */
export const ROLE_PERMISSIONS: Record<UserRoleCode, Permission[]> = {
  platform_admin: [
    'manage_users',
    'manage_categories', 
    'manage_events',
    'approve_events',
    'manage_locations',
    'manage_organization',
    'view_analytics',
    'access_admin'
  ],
  entity_admin: [
    'manage_users',
    'manage_categories',
    'manage_events', 
    'approve_events',
    'manage_locations',
    'manage_organization',
    'view_analytics',
    'access_admin'
  ],
  entity_staff: [
    'manage_categories',
    'manage_events',
    'approve_events',
    'manage_locations', 
    'view_analytics',
    'access_admin'
  ],
  organizer_admin: [
    'manage_events',
    'view_analytics'
  ]
};

/**
 * Resource-based access control mapping
 */
export const RESOURCE_PERMISSIONS: Record<string, Permission[]> = {
  'admin': ['access_admin'],
  'users': ['manage_users'],
  'events': ['manage_events'],
  'events/approve': ['approve_events'],
  'categories': ['manage_categories'],
  'locations': ['manage_locations'],
  'organization': ['manage_organization'],
  'analytics': ['view_analytics']
};
