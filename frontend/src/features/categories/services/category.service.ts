/**
 * Category Service
 * API service functions for category CRUD operations
 * 
 * ARCHITECTURE RULES:
 * - All single item operations (CREATE, READ, UPDATE, DELETE) use ApiResponse<T> wrapper
 * - Collection operations (INDEX) use Laravel Resource Collection structure directly
 * - Consistent error handling across all methods
 * - TypeScript safety with proper typing
 */

import { AxiosResponse, AxiosError } from 'axios';
import apiClient from '../../../services/apiClient';
import {
  Category,
  CategoryPagination,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryQueryParams,
  ApiResponse,
  ApiErrorResponse,
} from '../../../types/category.types';

/**
 * Fetch paginated categories
 * Returns Laravel Resource Collection with pagination metadata
 */
export const getCategories = async (params: CategoryQueryParams = {}): Promise<CategoryPagination> => {
  try {
    // Laravel Resource collections with pagination return the paginated data directly
    const response: AxiosResponse<CategoryPagination> = await apiClient.get('/v1/categories', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 15,
        search: params.search || '',
        active: params.active,
      },
    });
    
    // Laravel Resource pagination structure is directly in response.data
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single category by ID
 * Returns ApiResponse<Category> wrapper structure
 */
export const getCategory = async (id: number): Promise<Category> => {
  try {
    const response: AxiosResponse<ApiResponse<Category>> = await apiClient.get(`/v1/categories/${id}`);
    
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new category
 * Returns ApiResponse<Category> wrapper structure
 */
export const createCategory = async (categoryData: CreateCategoryData): Promise<Category> => {
  try {
    const response: AxiosResponse<ApiResponse<Category>> = await apiClient.post('/v1/categories', {
      name: categoryData.name,
      description: categoryData.description || null,
      color: categoryData.color || null,
      is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
    });
    
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing category
 * Returns ApiResponse<Category> wrapper structure
 */
export const updateCategory = async (
  id: number, 
  categoryData: UpdateCategoryData
): Promise<Category> => {
  try {
    const response: AxiosResponse<ApiResponse<Category>> = await apiClient.put(`/v1/categories/${id}`, {
      name: categoryData.name,
      description: categoryData.description,
      color: categoryData.color,
      is_active: categoryData.is_active,
    });
    
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a category
 * Returns success message only
 */
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/v1/categories/${id}`);
    
    // No return needed for delete operations
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    // Enhanced error handling for permission and not found errors
    if (axiosError.response?.status === 404 || axiosError.response?.status === 403) {
      throw new Error('No tienes permiso para eliminar esta categoría o ya no existe.');
    }
    
    // For other errors, provide a user-friendly message
    const errorMessage = axiosError.response?.data?.message || 
                        'Error al eliminar la categoría. Inténtalo de nuevo.';
    throw new Error(errorMessage);
  }
};

/**
 * Toggle category active status
 * Returns ApiResponse<Category> wrapper structure
 */
export const toggleCategoryStatus = async (id: number): Promise<Category> => {
  try {
    const response: AxiosResponse<ApiResponse<Category>> = await apiClient.patch(`/v1/categories/${id}/toggle-status`);
    
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get active categories only (useful for dropdowns/selects)
 * Returns ApiResponse<Category[]> wrapper structure
 */
export const getActiveCategories = async (): Promise<Category[]> => {
  try {
    const response: AxiosResponse<ApiResponse<Category[]>> = await apiClient.get('/v1/categories/active');
    
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Search categories by name
 * Convenience method using getCategories with search parameter
 */
export const searchCategories = async (query: string, page: number = 1): Promise<CategoryPagination> => {
  return getCategories({
    search: query,
    page,
    per_page: 15,
  });
};

/**
 * Batch update categories
 * Processes multiple updates sequentially
 */
export const batchUpdateCategories = async (
  updates: Array<{ id: number; data: UpdateCategoryData }>
): Promise<Category[]> => {
  try {
    const promises = updates.map(({ id, data }) => updateCategory(id, data));
    return await Promise.all(promises);
  } catch (error) {
    throw error;
  }
};

/**
 * Validate category data before submission
 * Client-side validation to reduce server round trips
 */
export const validateCategoryData = (data: CreateCategoryData | UpdateCategoryData): string[] => {
  const errors: string[] = [];
  
  if ('name' in data && data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Category name is required');
    } else if (data.name.trim().length < 2) {
      errors.push('Category name must be at least 2 characters long');
    } else if (data.name.trim().length > 255) {
      errors.push('Category name must not exceed 255 characters');
    }
  }
  
  if (data.description && data.description.length > 1000) {
    errors.push('Description must not exceed 1000 characters');
  }
  
  if (data.color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(data.color)) {
    errors.push('Color must be a valid hexadecimal color (e.g., #FF0000)');
  }
  
  return errors;
};

/**
 * Get public categories for public calendar (no auth required)
 */
export const getPublicCategories = async (): Promise<{
  id: number;
  name: string;
  slug: string;
  color: string;
  description?: string;
  event_count: number;
}[]> => {
  try {
    const response = await apiClient.get('/v1/public/categories');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Export default object with all service functions
 */
const categoryService = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getActiveCategories,
  searchCategories,
  batchUpdateCategories,
  validateCategoryData,
  getPublicCategories,
};

export default categoryService;
