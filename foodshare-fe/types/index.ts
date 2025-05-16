/**
 * Core data types for the FoodShare application
 */

/**
 * Type of post - either donation or request
 */
export enum PostType {
  DONATION = 'donation',
  REQUEST = 'request',
}

/**
 * Status of a post
 */
export enum PostStatus {
  ACTIVE = 'active',
  CLAIMED = 'claimed',
  PICKED_UP = 'pickedUp',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

/**
 * Location as a simple string address
 */
export type Location = string;

/**
 * User profile data
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  donationsCount: number;
  receivedCount: number;
  rating: number;
}

/**
 * Food post (donation or request)
 */
export interface FoodPost {
  id: string;
  type: PostType;
  title: string;
  description: string;
  quantity: string;
  location: Location;
  expiryDate: string;
  status: PostStatus;
  createdAt: string;
  updatedAt?: string;
  urgency?: string;
  ownerId: string;
  owner?: User;
  claimerId?: string;
  claimer?: User;
}

/**
 * Claim request for a donation
 */
export interface Claim {
  id: string;
  postId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

/**
 * Rating for a user after a transaction
 */
export interface Rating {
  id: string;
  score: number; // 1-5 stars
  comment?: string;
  fromUserId: string;
  toUserId: string;
  postId: string;
  createdAt: string;
}

/**
 * Notification type
 */
export interface Notification {
  id: string;
  type: 'claim_approved' | 'expiry_warning' | 'new_claim' | 'pickup_reminder';
  message: string;
  read: boolean;
  userId: string;
  relatedPostId?: string;
  createdAt: string;
} 