import { apiService, ApiError } from './api.service';
import { FoodPost, PostType } from '@/types';

/**
 * Service for handling food posts (donations and requests)
 */
class PostService {
  /**
   * Get all posts with optional filtering
   * @param params - Optional filters for posts
   * @returns Promise with the list of posts
   */
  async getPosts(params?: {
    type?: PostType;
    status?: string;
    distance?: number;
    expiryFilter?: 'soon' | 'all';
  }): Promise<FoodPost[]> {
    // Convert the params to strings for the API
    const apiParams: Record<string, string> = {};
    
    if (params) {
      if (params.type) {
        apiParams.type = params.type.toString();
      }
      
      if (params.status) {
        apiParams.status = params.status;
      }
      
      if (params.distance) {
        apiParams.distance = params.distance.toString();
      }
      
      if (params.expiryFilter) {
        apiParams.expiryFilter = params.expiryFilter;
      }
    }
    
    return apiService.get<FoodPost[]>('/posts', apiParams);
  }

  /**
   * Get post by ID
   * @param id - Post ID
   * @returns Promise with the post data
   */
  async getPostById(id: string): Promise<FoodPost | null> {
    try {
      return await apiService.get<FoodPost>(`/posts/${id}`);
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }

  /**
   * Create a new post
   * @param postData - Post data
   * @returns Promise with the created post
   */
  async createPost(postData: Omit<FoodPost, 'id' | 'status' | 'createdAt' | 'ownerId'>): Promise<FoodPost> {
    return apiService.post<FoodPost>('/posts', postData);
  }

  /**
   * Update a post
   * @param id - Post ID
   * @param postData - Updated post data
   * @returns Promise with the updated post
   */
  async updatePost(id: string, postData: Partial<FoodPost>): Promise<FoodPost> {
    return apiService.patch<FoodPost>(`/posts/${id}`, postData);
  }

  /**
   * Delete a post
   * @param id - Post ID
   */
  async deletePost(id: string): Promise<void> {
    console.log(`Attempting to delete post with ID: ${id}`);
    
    if (!id) {
      console.error('Invalid post ID received for deletion');
      throw new Error('Invalid post ID');
    }
    
    try {
      // Ensure we're using the exact endpoint format
      await apiService.delete(`/posts/${id}`);
      console.log('Delete post successful');
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
      
      // Special handling for 404 errors
      if (error instanceof Error && error.message.includes('404')) {
        console.warn(`Post with ID ${id} not found or already deleted`);
      }
      
      // Pass through the server error message if it's an ApiError
      if (error instanceof ApiError) {
        // If we have a more specific error message from the server, use it
        if (error.data && error.data.message) {
          throw new Error(error.data.message);
        }
      }
      
      throw error; // Always throw so the component can handle it
    }
  }

  /**
   * Claim a donation
   * @param postId - Post ID to claim
   * @returns Promise with the claimed post
   */
  async claimDonation(postId: string): Promise<FoodPost> {
    // Use the JWT token in the API service for authentication
    // The backend will extract the user ID from the token
    try {
      const claim = await apiService.post<FoodPost>(`/posts/${postId}/claim`, {});
      return claim;
    } catch (error) {
      console.error('Error claiming donation:', error);
      throw error;
    }
  }

  /**
   * Fulfill a request
   * @param postId - Post ID to fulfill
   * @returns Promise with the fulfilled request
   */
  async fulfillRequest(postId: string): Promise<FoodPost> {
    try {
      const result = await apiService.post<FoodPost>(`/posts/${postId}/fulfill`, {});
      return result;
    } catch (error) {
      console.error('Error fulfilling request:', error);
      throw error;
    }
  }

  /**
   * Mark a post as picked up
   * @param postId - Post ID to mark as picked up
   * @returns Promise with the updated post
   */
  async markAsPickedUp(postId: string): Promise<FoodPost> {
    try {
      const result = await apiService.post<FoodPost>(`/posts/${postId}/pickup`, {});
      return result;
    } catch (error) {
      console.error('Error marking post as picked up:', error);
      throw error;
    }
  }

  /**
   * Mark a post as completed
   * @param postId - Post ID to mark as completed
   * @returns Promise with the updated post
   */
  async markAsCompleted(postId: string): Promise<FoodPost> {
    try {
      const result = await apiService.post<FoodPost>(`/posts/${postId}/complete`, {});
      return result;
    } catch (error) {
      console.error('Error marking post as completed:', error);
      throw error;
    }
  }

  /**
   * Get posts claimed by the current user
   * @returns Promise with the list of claimed posts
   */
  async getClaimedPosts(): Promise<FoodPost[]> {
    try {
      return await apiService.get<FoodPost[]>('/posts/my-claims');
    } catch (error) {
      console.error('Error fetching claimed posts:', error);
      
      // For debugging purposes only - helps identify backend issues
      if (error instanceof ApiError && error.statusCode === 500) {
        console.error('Server error details:', error.data);
      }
      
      // Return empty array to prevent UI errors
      return [];
    }
  }

  /**
   * Update post status (e.g., to mark as picked up or completed)
   * @param postId - Post ID
   * @param status - New status
   * @returns Promise with the updated post
   */
  async updatePostStatus(postId: string, status: string): Promise<FoodPost> {
    return this.updatePost(postId, { status: status as any });
  }
}

// Export a singleton instance
export const postService = new PostService(); 