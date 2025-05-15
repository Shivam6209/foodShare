import { config } from '../config';
import { mockPosts, mockUsers, mockClaims, mockRatings, mockNotifications } from '../mock/data';
import { FoodPost, PostType, PostStatus, User, Claim, Rating, Notification } from '@/types';

/**
 * Mock API utility to simulate real API behavior
 * All services will use this instead of direct fetch calls during development
 */
class MockApiService {
  /**
   * Simulates network delay
   * @param ms Milliseconds to delay
   */
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simulates a GET request
   * @param endpoint API endpoint
   * @param params Query parameters
   * @returns Promise with response data
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    // Simulate network delay
    await this.delay();
    
    // Handle endpoints
    if (endpoint.startsWith('/posts')) {
      if (endpoint.includes('/')) {
        const segments = endpoint.split('/');
        if (segments.length > 2) {
          // Individual post by ID
          const postId = segments[2];
          const post = mockPosts.find(p => p.id === postId);
          
          if (!post) {
            throw new Error(`Post not found: ${postId}`);
          }
          
          return post as unknown as T;
        }
      }
      
      // All posts with optional filtering
      let filteredPosts = [...mockPosts];
      
      if (params) {
        if (params.type) {
          filteredPosts = filteredPosts.filter(post => post.type === params.type);
        }
        
        if (params.status) {
          filteredPosts = filteredPosts.filter(post => post.status.toString() === params.status);
        }
        
        if (params.expiryFilter === 'soon') {
          const twoDaysFromNow = new Date(Date.now() + 86400000 * 2).toISOString();
          filteredPosts = filteredPosts.filter(post => post.expiryDate <= twoDaysFromNow);
        }
      }
      
      return filteredPosts as unknown as T;
    } 
    else if (endpoint.startsWith('/users')) {
      if (endpoint.includes('/')) {
        const segments = endpoint.split('/');
        if (segments.length > 2) {
          // Individual user by ID
          const userId = segments[2];
          const user = mockUsers.find(u => u.id === userId);
          
          if (!user) {
            throw new Error(`User not found: ${userId}`);
          }
          
          return user as unknown as T;
        }
      }
      
      return mockUsers as unknown as T;
    } 
    else if (endpoint.startsWith('/claims')) {
      if (params?.userId) {
        return mockClaims.filter(claim => claim.userId === params.userId) as unknown as T;
      } else if (params?.postId) {
        return mockClaims.filter(claim => claim.postId === params.postId) as unknown as T;
      }
      
      return mockClaims as unknown as T;
    } 
    else if (endpoint.startsWith('/ratings')) {
      if (params?.userId) {
        return mockRatings.filter(
          rating => rating.fromUserId === params.userId || rating.toUserId === params.userId
        ) as unknown as T;
      } else if (params?.postId) {
        return mockRatings.filter(rating => rating.postId === params.postId) as unknown as T;
      }
      
      return mockRatings as unknown as T;
    } 
    else if (endpoint.startsWith('/notifications')) {
      if (params?.userId) {
        return mockNotifications.filter(
          notification => notification.userId === params.userId
        ) as unknown as T;
      }
      
      return mockNotifications as unknown as T;
    }
    
    throw new Error(`Unhandled endpoint: ${endpoint}`);
  }

  /**
   * Simulates a POST request
   * @param endpoint API endpoint
   * @param data Request body
   * @returns Promise with response data
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    // Simulate network delay
    await this.delay();
    
    if (endpoint.startsWith('/posts')) {
      // Creating a new post
      const newPost: FoodPost = {
        id: `post-${Date.now()}`,
        ...data,
        status: PostStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        ownerId: data.ownerId || 'user-1', // Default to first user if not specified
      };
      
      // In a real API, this would be saved to a database
      return newPost as unknown as T;
    } 
    else if (endpoint.startsWith('/claims')) {
      // Creating a new claim
      const newClaim: Claim = {
        id: `claim-${Date.now()}`,
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // In a real API, this would be saved to a database
      return newClaim as unknown as T;
    } 
    else if (endpoint.startsWith('/ratings')) {
      // Creating a new rating
      const newRating: Rating = {
        id: `rating-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
      };
      
      // In a real API, this would be saved to a database
      return newRating as unknown as T;
    }
    
    throw new Error(`Unhandled endpoint: ${endpoint}`);
  }

  /**
   * Simulates a PUT request
   * @param endpoint API endpoint
   * @param data Request body
   * @returns Promise with response data
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    // Simulate network delay
    await this.delay();
    
    if (endpoint.startsWith('/posts')) {
      const segments = endpoint.split('/');
      if (segments.length > 2) {
        // Updating a post
        const postId = segments[2];
        const post = mockPosts.find(p => p.id === postId);
        
        if (!post) {
          throw new Error(`Post not found: ${postId}`);
        }
        
        // In a real API, this would update the database
        const updatedPost = {
          ...post,
          ...data,
        };
        
        return updatedPost as unknown as T;
      }
    } 
    else if (endpoint.startsWith('/claims')) {
      const segments = endpoint.split('/');
      if (segments.length > 2) {
        // Updating a claim status
        const claimId = segments[2];
        const claim = mockClaims.find(c => c.id === claimId);
        
        if (!claim) {
          throw new Error(`Claim not found: ${claimId}`);
        }
        
        // In a real API, this would update the database
        const updatedClaim = {
          ...claim,
          ...data,
        };
        
        return updatedClaim as unknown as T;
      }
    }
    
    throw new Error(`Unhandled endpoint: ${endpoint}`);
  }

  /**
   * Simulates a DELETE request
   * @param endpoint API endpoint
   * @returns Promise with success status
   */
  async delete<T>(endpoint: string): Promise<T> {
    // Simulate network delay
    await this.delay();
    
    if (endpoint.startsWith('/posts')) {
      const segments = endpoint.split('/');
      if (segments.length > 2) {
        // Deleting a post
        const postId = segments[2];
        const post = mockPosts.find(p => p.id === postId);
        
        if (!post) {
          throw new Error(`Post not found: ${postId}`);
        }
        
        // In a real API, this would delete from the database
        return { success: true } as unknown as T;
      }
    }
    
    throw new Error(`Unhandled endpoint: ${endpoint}`);
  }
}

// Export a singleton instance
export const mockApiService = new MockApiService(); 