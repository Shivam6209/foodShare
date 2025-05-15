import { apiService } from './api.service';
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
    return apiService.put<FoodPost>(`/posts/${id}`, postData);
  }

  /**
   * Delete a post
   * @param id - Post ID
   */
  async deletePost(id: string): Promise<void> {
    await apiService.delete(`/posts/${id}`);
  }

  /**
   * Claim a donation
   * @param postId - Post ID to claim
   * @returns Promise with the claimed post
   */
  async claimDonation(postId: string): Promise<FoodPost> {
    // In a real API, this might create a claim record and update the post
    const claim = await apiService.post('/claims', {
      postId,
      userId: 'user-1', // Would use actual logged-in user ID
    });
    
    // Update the post status
    return this.updatePostStatus(postId, 'claimed');
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