/**
 * API Client
 * HTTP client for Laravel backend with JWT authentication and error handling
 */

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
}

// HTTP method types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  method: HttpMethod;
  headers: HeadersInit;
  body?: string;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.baseURL = `${baseUrl}/api/v1`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  /**
   * Get request headers with authentication
   */
  private getHeaders(customHeaders: HeadersInit = {}): HeadersInit {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();
    
    if (token) {
      (headers as any).Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    let responseData: any;

    try {
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch {
      responseData = null;
    }

    // Handle different HTTP status codes
    if (response.ok) {
      // Success (200-299)
      return responseData;
    }

    // Handle specific error codes
    switch (response.status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        this.handleUnauthorized();
        throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');

      case 403:
        // Forbidden
        throw new Error('Acceso denegado. No tiene permisos suficientes.');

      case 404:
        // Not found
        throw new Error('Recurso no encontrado.');

      case 422:
        // Validation error
        const validationMessage = responseData?.message || 'Error de validación.';
        const validationErrors = responseData?.errors || {};
        const errorMessages = Object.values(validationErrors).flat();
        
        if (errorMessages.length > 0) {
          throw new Error(`${validationMessage} ${errorMessages.join(' ')}`);
        }
        throw new Error(validationMessage);

      case 429:
        // Too many requests
        throw new Error('Demasiadas solicitudes. Por favor, espere un momento.');

      case 500:
        // Internal server error
        const serverMessage = responseData?.message || 'Error interno del servidor.';
        throw new Error(serverMessage);

      case 503:
        // Service unavailable
        throw new Error('Servicio no disponible. Por favor, intente más tarde.');

      default:
        // Generic error
        const errorMessage = responseData?.message || `Error HTTP ${response.status}`;
        throw new Error(errorMessage);
    }
  }

  /**
   * Handle unauthorized access
   */
  private handleUnauthorized(): void {
    if (typeof window === 'undefined') return;

    // Clear authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    // Redirect to login page
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    url: string, 
    config: RequestConfig, 
    retries: number = 1
  ): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    try {
      const response = await fetch(fullUrl, {
        ...config,
        headers: this.getHeaders(config.headers),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      // Retry on network errors
      if (retries > 0 && this.isNetworkError(error)) {
        await this.delay(1000); // Wait 1 second before retry
        return this.makeRequest<T>(url, config, retries - 1);
      }

      throw error;
    }
  }

  /**
   * Check if error is a network error that can be retried
   */
  private isNetworkError(error: any): boolean {
    return (
      error instanceof TypeError ||
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('NetworkError')
    );
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, headers?: HeadersInit): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'GET',
      headers: headers || {},
    });
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, headers?: HeadersInit): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      headers: headers || {},
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, headers?: HeadersInit): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      headers: headers || {},
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, headers?: HeadersInit): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'PATCH',
      headers: headers || {},
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, headers?: HeadersInit): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'DELETE',
      headers: headers || {},
    });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T = any>(url: string, formData: FormData): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData - browser will set it automatically with boundary

    return this.makeRequest<T>(url, {
      method: 'POST',
      headers,
      body: formData as any,
    });
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    if (typeof window === 'undefined') return;

    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Set base URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export { ApiClient };