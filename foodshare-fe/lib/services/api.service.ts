import { config } from '../config';
import { mockApiService } from './mock.service';

/**
 * Determine if we should use mock data
 * In a real project, this would be controlled by an environment variable
 */
const USE_MOCK = process.env.NODE_ENV === 'development';

/**
 * Base API service for making requests to the backend
 */
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.api.url;
  }

  /**
   * Make a GET request to the API
   * @param endpoint - API endpoint to call
   * @param params - Optional query parameters
   * @returns Promise with the response data
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    // Use mock data in development
    if (USE_MOCK) {
      return mockApiService.get<T>(endpoint, params);
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Make a POST request to the API
   * @param endpoint - API endpoint to call
   * @param data - Data to send in the request body
   * @returns Promise with the response data
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    // Use mock data in development
    if (USE_MOCK) {
      return mockApiService.post<T>(endpoint, data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Make a PUT request to the API
   * @param endpoint - API endpoint to call
   * @param data - Data to send in the request body
   * @returns Promise with the response data
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    // Use mock data in development
    if (USE_MOCK) {
      return mockApiService.put<T>(endpoint, data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Make a DELETE request to the API
   * @param endpoint - API endpoint to call
   * @returns Promise with the response data
   */
  async delete<T>(endpoint: string): Promise<T> {
    // Use mock data in development
    if (USE_MOCK) {
      return mockApiService.delete<T>(endpoint);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }
}

// Export a singleton instance
export const apiService = new ApiService(); 