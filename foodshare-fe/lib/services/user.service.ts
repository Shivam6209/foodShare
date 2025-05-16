import { apiService } from './api.service';
import { User, Rating } from '@/types';

/**
 * Service for handling user profiles and ratings
 */
class UserService {
  /**
   * Get user profile by ID
   * @param id - User ID
   * @returns Promise with the user data
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      return await apiService.get<User>(`/users/${id}`);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Get current logged-in user profile
   * @returns Promise with the user data
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Get the current user from the API 
      return await apiService.get<User>('/users/profile');
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  /**
   * Update user profile
   * @param userData - Updated user data 
   * @returns Promise with the updated user
   */
  async updateProfile(userData: Partial<User> & { currentPassword?: string }): Promise<User> {
    try {
      // Use the direct update endpoint without OTP
      console.log("Using direct profile update");
      return await apiService.post<User>('/users/profile-update', userData);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Check if this is an authentication error
      if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('401'))) {
        // Force logout and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
          window.location.href = '/login';
        }
      }
      
      throw error;
    }
  }

  /**
   * Get ratings for a user
   * @param userId - User ID
   * @returns Promise with the list of ratings
   */
  async getUserRatings(userId: string): Promise<Rating[]> {
    return apiService.get<Rating[]>('/ratings', { userId });
  }

  /**
   * Rate a user
   * @param userId - User ID to rate
   * @param postId - Related post ID
   * @param score - Rating score (1-5)
   * @param comment - Optional comment
   * @returns Promise with the created rating
   */
  async rateUser(userId: string, postId: string, score: number, comment?: string): Promise<Rating> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    return apiService.post<Rating>('/ratings', {
      fromUserId: currentUser.id,
      toUserId: userId,
      postId,
      score,
      comment,
    });
  }
}

// Export a singleton instance
export const userService = new UserService(); 