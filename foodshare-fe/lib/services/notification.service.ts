import { apiService } from './api.service';
import { Notification } from '@/types';
import { userService } from './user.service';

/**
 * Service for handling notifications
 */
class NotificationService {
  /**
   * Get all notifications for the current user
   * @param includeRead - Whether to include already read notifications
   * @returns Promise with notifications
   */
  async getNotifications(includeRead: boolean = false): Promise<Notification[]> {
    const currentUser = await userService.getCurrentUser();
    if (!currentUser) {
      return [];
    }
    
    try {
      const notifications = await apiService.get<Notification[]>('/notifications', { 
        userId: currentUser.id,
      });
      
      // Filter out read notifications if not requested
      if (!includeRead) {
        return notifications.filter(n => !n.read);
      }
      
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark a notification as read
   * @param id - Notification ID
   * @returns Promise with the updated notification
   */
  async markAsRead(id: string): Promise<Notification | null> {
    try {
      return apiService.put<Notification>(`/notifications/${id}`, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }
  }

  /**
   * Mark all notifications as read
   * @returns Promise indicating success
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const notifications = await this.getNotifications(false);
      
      // Use Promise.all to update all notifications in parallel
      await Promise.all(
        notifications.map(notification => this.markAsRead(notification.id))
      );
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const notificationService = new NotificationService(); 