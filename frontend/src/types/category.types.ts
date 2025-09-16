/**
 * Category Types
 * TypeScript interfaces and types for category-related data structures
 */

// Re-export authentication types for backward compatibility
export type { User, LoginCredentials, LoginResponse } from './auth.types';

// Re-export appearance types for consistency
export type { 
  ThemeSettings, 
  AppearanceFormData, 
  AppearanceResponse,
  DEFAULT_THEME
} from './appearance.types';

// Base category interface
export interface Category {
  id: number;
  name: string;
  slug: string;
  entity_id: number;
  color?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Data structure for creating a new category
export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  is_active?: boolean;
}

// Data structure for updating an existing category
export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  is_active?: boolean;
}

// Pagination meta information
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
}

// Pagination link structure
export interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

// Complete pagination response for categories - matches Laravel structure
export interface CategoryPagination {
  data: Category[];
  meta: PaginationMeta & {
    links: PaginationLink[];
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Error response from API
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
}

// Query parameters for fetching categories
export interface CategoryQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  active?: boolean;
}

// Filter options for category status
export type CategoryFilterStatus = 'all' | 'active' | 'inactive';

// Form validation errors
export interface CategoryFormErrors {
  name?: string;
  description?: string;
  color?: string;
  is_active?: string;
}

// Component prop types for better reusability
export interface CategoryTableProps {
  categories: Category[];
  pagination: CategoryPagination | null;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number, categoryName: string) => void;
  onPageChange: (page: number) => void;
}

export interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category | null;
}
