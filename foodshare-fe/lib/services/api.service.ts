import { config } from '../config';

/**
 * Check if code is running in browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Custom API error class
 */
export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(statusCode: number, message: string, data: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Base API service for making requests to the backend
 */
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.api.url;
  }

  /**
   * Parse cookies to get a specific cookie value
   */
  private getCookie(name: string): string | null {
    if (!isBrowser) return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  /**
   * Get authentication token from localStorage or cookies
   */
  private getAuthToken(): string | null {
    if (!isBrowser) return null;
    
    // First try localStorage
    let token = localStorage.getItem('token');
    console.log('Token from localStorage:', !!token);
    
    // If not in localStorage, try cookies
    if (!token) {
      token = this.getCookie('token');
      console.log('Token from cookies:', !!token);
      
      // If found in cookie but not localStorage, sync them
      if (token) {
        console.log('Syncing token from cookie to localStorage');
        localStorage.setItem('token', token);
      }
    }
    
    // If token exists, verify it has not expired
    if (token) {
      try {
        // JWT consists of three parts: header.payload.signature
        const parts = token.split('.');
        if (parts.length === 3) {
          // Decode the payload (the middle part)
          const payload = JSON.parse(atob(parts[1]));
          
          // Check expiration time (exp field in JWT)
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            console.error('Token has expired, clearing it');
            localStorage.removeItem('token');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
            return null;
          }
        }
      } catch (e) {
        console.error('Error checking token validity:', e);
        // If there's any error, it's safer to consider the token invalid
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        return null;
      }
    }
    
    return token;
  }

  /**
   * Handle response errors in a consistent way
   */
  private async handleResponseError(response: Response): Promise<never> {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'Unknown error occurred' };
    }

    let errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
    
    if (response.status === 401) {
      // Handle authentication errors
      if (isBrowser) {
        // Clear both localStorage and cookies
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          // Add a small delay to ensure this message can be seen
          console.error('Authentication error:', errorMessage);
          setTimeout(() => {
            window.location.href = '/login?error=session_expired';
          }, 100);
        }
      }
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (response.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    throw new ApiError(response.status, errorMessage, errorData);
  }

  /**
   * Make a GET request to the API
   * @param endpoint - API endpoint to call
   * @param params - Optional query parameters
   * @returns Promise with the response data
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Network error:', error);
      throw new ApiError(0, 'Network error. Please check your connection.', null);
    }
  }

  /**
   * Make a POST request to the API
   * @param endpoint - API endpoint to call
   * @param data - Data to send in the request body
   * @returns Promise with the response data
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const token = this.getAuthToken();
    console.log(`API POST to ${endpoint} - Token available: ${!!token}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set');
    } else {
      console.warn('No token available for API request to:', endpoint);
    }
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error(`Error response from ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText
        });
        await this.handleResponseError(response);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Network error:', error);
      throw new ApiError(0, 'Network error. Please check your connection.', null);
    }
  }

  /**
   * Make a PUT request to the API
   * @param endpoint - API endpoint to call
   * @param data - Data to send in the request body
   * @returns Promise with the response data
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Network error:', error);
      throw new ApiError(0, 'Network error. Please check your connection.', null);
    }
  }

  /**
   * Make a DELETE request to the API
   * @param endpoint - API endpoint to call
   * @returns Promise with the response data
   */
  async delete<T>(endpoint: string): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Network error:', error);
      throw new ApiError(0, 'Network error. Please check your connection.', null);
    }
  }

  /**
   * Make a PATCH request to the API
   * @param endpoint - API endpoint to call
   * @param data - Data to send in the request body
   * @returns Promise with the response data
   */
  async patch<T>(endpoint: string, data: any): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Network error:', error);
      throw new ApiError(0, 'Network error. Please check your connection.', null);
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService(); 