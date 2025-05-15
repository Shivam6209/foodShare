import { FoodPost, PostType, PostStatus, User, Claim, Rating, Notification } from '@/types';

/**
 * Mock users data
 */
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    avatar: 'https://i.pravatar.cc/150?u=jane',
    donationsCount: 5,
    receivedCount: 2,
    rating: 4.8,
  },
  {
    id: 'user-2',
    name: 'John Smith',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?u=john',
    donationsCount: 1,
    receivedCount: 3,
    rating: 4.5,
  },
  {
    id: 'user-3',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://i.pravatar.cc/150?u=alice',
    donationsCount: 3,
    receivedCount: 0,
    rating: 5.0,
  },
];

/**
 * Mock food posts data
 */
export const mockPosts: FoodPost[] = [
  {
    id: 'post-1',
    type: PostType.DONATION,
    title: 'Fresh vegetables from garden',
    description: 'Extra vegetables from my garden: tomatoes, cucumbers, and lettuce.',
    quantity: '5 lbs assorted',
    location: {
      address: '123 Main St, Anytown, USA',
      latitude: 40.7128,
      longitude: -74.0060,
    },
    expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    status: PostStatus.ACTIVE,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    ownerId: 'user-1',
    owner: mockUsers[0],
  },
  {
    id: 'post-2',
    type: PostType.REQUEST,
    title: 'Need bread and milk',
    description: 'Family in need of basic groceries.',
    quantity: 'Any amount helps',
    location: {
      address: '456 Oak St, Anytown, USA',
      latitude: 40.7200,
      longitude: -74.0100,
    },
    expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    status: PostStatus.ACTIVE,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    ownerId: 'user-2',
    owner: mockUsers[1],
  },
  {
    id: 'post-3',
    type: PostType.DONATION,
    title: 'Leftover birthday cake',
    description: 'Half a birthday cake, chocolate with vanilla frosting.',
    quantity: '1 cake (half)',
    location: {
      address: '789 Pine St, Anytown, USA',
      latitude: 40.7300,
      longitude: -74.0200,
    },
    expiryDate: new Date(Date.now() + 86400000 * 1).toISOString(), // 1 day from now
    status: PostStatus.CLAIMED,
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), // 12 hours ago
    ownerId: 'user-3',
    owner: mockUsers[2],
    claimerId: 'user-2',
    claimer: mockUsers[1],
  },
  {
    id: 'post-4',
    type: PostType.DONATION,
    title: 'Canned goods clearance',
    description: 'Moving out, need to get rid of canned beans, corn, and soup.',
    quantity: '10 cans',
    location: {
      address: '101 River Rd, Anytown, USA',
      latitude: 40.7400,
      longitude: -74.0300,
    },
    expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
    status: PostStatus.ACTIVE,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    ownerId: 'user-1',
    owner: mockUsers[0],
  },
  {
    id: 'post-5',
    type: PostType.REQUEST,
    title: 'Food for community event',
    description: 'Looking for food donations for neighborhood picnic.',
    quantity: 'Any contributions welcome',
    location: {
      address: '202 Park Ave, Anytown, USA',
      latitude: 40.7500,
      longitude: -74.0400,
    },
    expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    status: PostStatus.ACTIVE,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    ownerId: 'user-3',
    owner: mockUsers[2],
  },
];

/**
 * Mock claims data
 */
export const mockClaims: Claim[] = [
  {
    id: 'claim-1',
    postId: 'post-3',
    userId: 'user-2',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 0.3).toISOString(), // 7 hours ago
  },
  {
    id: 'claim-2',
    postId: 'post-1',
    userId: 'user-3',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 0.1).toISOString(), // 2 hours ago
  },
];

/**
 * Mock ratings data
 */
export const mockRatings: Rating[] = [
  {
    id: 'rating-1',
    score: 5,
    comment: 'Great quality vegetables, thank you!',
    fromUserId: 'user-2',
    toUserId: 'user-1',
    postId: 'post-1',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
  },
  {
    id: 'rating-2',
    score: 4,
    comment: 'Food was good, but pickup location was hard to find.',
    fromUserId: 'user-3',
    toUserId: 'user-1',
    postId: 'post-4',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
  },
];

/**
 * Mock notifications data
 */
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'claim_approved',
    message: 'Your claim for "Leftover birthday cake" has been approved.',
    read: false,
    userId: 'user-2',
    relatedPostId: 'post-3',
    createdAt: new Date(Date.now() - 86400000 * 0.3).toISOString(), // 7 hours ago
  },
  {
    id: 'notif-2',
    type: 'new_claim',
    message: 'Someone has claimed your "Fresh vegetables from garden".',
    read: false,
    userId: 'user-1',
    relatedPostId: 'post-1',
    createdAt: new Date(Date.now() - 86400000 * 0.1).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-3',
    type: 'expiry_warning',
    message: 'Your post "Leftover birthday cake" is expiring soon.',
    read: true,
    userId: 'user-3',
    relatedPostId: 'post-3',
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), // 12 hours ago
  },
]; 