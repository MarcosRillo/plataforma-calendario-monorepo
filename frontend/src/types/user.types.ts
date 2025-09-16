/**
 * User Types
 * 
 * Type definitions for user-related data structures.
 * Basic interface for user references in events.
 */

/**
 * User role constants
 */
export const USER_ROLE = {
  PLATFORM_ADMIN: 'platform_admin',
  ENTITY_ADMIN: 'entity_admin',
  ENTITY_STAFF: 'entity_staff',
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

/**
 * Basic User interface for relationships
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
