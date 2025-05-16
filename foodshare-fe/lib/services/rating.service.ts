import { apiService } from './api.service';

interface HasRatedResponse {
  hasRated: boolean;
}

/**
 * Service for handling user ratings
 */
class RatingService {
  /**
   * Create a new rating
   * @param data - Rating data to submit
   */
  async createRating(data: {
    ratedUserId: string;
    postId: string;
    value: number;
    comment?: string;
  }) {
    try {
      return await apiService.post('/ratings', data);
    } catch (error) {
      console.error('Error creating rating:', error);
      throw error;
    }
  }

  /**
   * Get all ratings for a specific user
   * @param userId - User ID to get ratings for
   */
  async getUserRatings(userId: string) {
    try {
      return await apiService.get(`/ratings/user/${userId}`);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      return [];
    }
  }

  /**
   * Check if current user has already rated another user for a specific post
   * @param postId - Post ID
   * @param ratedUserId - User ID being rated
   */
  async checkIfRated(postId: string, ratedUserId: string): Promise<boolean> {
    try {
      const response = await apiService.get<HasRatedResponse>(`/ratings/check/${postId}/${ratedUserId}`);
      return response.hasRated;
    } catch (error) {
      console.error('Error checking rating status:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const ratingService = new RatingService(); 