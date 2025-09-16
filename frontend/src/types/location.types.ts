/**
 * Location Types
 * 
 * Type definitions for location-related data structures.
 * These interfaces match the API Resources from the Laravel backend.
 */

/**
 * Base Location interface - matches LocationResource from backend
 */
export interface Location {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  
  // Geographic coordinates
  latitude?: number;
  longitude?: number;
  
  // Capacity and features
  max_capacity?: number;
  features: string[];
  
  // Contact information
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  
  // Meta information
  is_active: boolean;
  notes?: string;
  
  // Entity relationship
  entity_id: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Location creation/update form data
 */
export interface LocationFormData {
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  
  // Geographic coordinates
  latitude?: number;
  longitude?: number;
  
  // Capacity and features
  max_capacity?: number;
  features: string[];
  
  // Contact information
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  
  // Meta information
  is_active: boolean;
  notes?: string;
}

/**
 * Location filters for API queries
 */
export interface LocationFilters {
  search?: string;
  city?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

/**
 * Paginated location response - matches Laravel structure
 */
export interface LocationPagination {
  data: Location[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    path: string;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

/**
 * Location with pivot data for events
 */
export interface EventLocation extends Location {
  pivot?: {
    event_id: number;
    location_id: number;
    is_primary?: boolean;
    notes?: string;
  };
}
