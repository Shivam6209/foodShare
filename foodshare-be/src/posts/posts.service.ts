import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodPost } from './entities/food-post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostType } from '../common/enums/post-type.enum';
import { PostStatus } from '../common/enums/post-status.enum';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(FoodPost)
    private postsRepository: Repository<FoodPost>,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<FoodPost> {
    const post = this.postsRepository.create({
      ...createPostDto,
      status: PostStatus.ACTIVE,
      expiryDate: new Date(createPostDto.expiryDate),
    });
    return this.postsRepository.save(post);
  }

  async findAll(
    type?: PostType,
    status?: PostStatus,
    expiryFilter?: 'soon' | 'all',
  ): Promise<FoodPost[]> {
    const query = this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.owner', 'owner')
      .leftJoinAndSelect('post.claimer', 'claimer');

    if (type) {
      query.andWhere('post.type = :type', { type });
    }

    if (status) {
      query.andWhere('post.status = :status', { status });
    }

    if (expiryFilter === 'soon') {
      // Posts expiring in the next 2 days
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      
      query.andWhere('post.expiryDate <= :expiry', { expiry: twoDaysFromNow });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<FoodPost> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['owner', 'claimer'],
    });
    
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }
    
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<FoodPost> {
    const post = await this.findOne(id);
    
    // Handle date transformation if needed
    if (updatePostDto.expiryDate) {
      updatePostDto.expiryDate = new Date(updatePostDto.expiryDate) as any;
    }
    
    this.postsRepository.merge(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    
    // Only allow deletion if post is in ACTIVE status
    if (post.status !== PostStatus.ACTIVE) {
      throw new Error(`Cannot delete post with status "${post.status}". Only posts with status "active" can be deleted.`);
    }
    
    const result = await this.postsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }
  }

  // Method to update the status of a post
  async updateStatus(id: string, status: PostStatus): Promise<FoodPost> {
    return this.update(id, { status });
  }

  // Method to claim a donation
  async claimDonation(postId: string, claimerId: string): Promise<FoodPost> {
    const post = await this.findOne(postId);
    
    if (post.type !== PostType.DONATION) {
      throw new Error('Only donation posts can be claimed');
    }
    
    if (post.status !== PostStatus.ACTIVE) {
      throw new Error('This post is not available for claiming');
    }

    // Get the user information for both owner and claimer
    const owner = await this.usersService.findOne(post.ownerId);
    const claimer = await this.usersService.findOne(claimerId);
    
    // Update the post
    const updatedPost = await this.update(postId, {
      status: PostStatus.CLAIMED,
      claimerId,
    });

    // Send notification email to the owner
    await this.emailService.sendDonationClaimedEmail(
      owner.email,
      owner.name,
      post.title,
      claimer.name,
      post.id
    );
    
    return updatedPost;
  }

  // Method to fulfill a request
  async fulfillRequest(postId: string, fulfillerId: string): Promise<FoodPost> {
    const post = await this.findOne(postId);
    
    if (post.type !== PostType.REQUEST) {
      throw new Error('Only request posts can be fulfilled');
    }
    
    if (post.status !== PostStatus.ACTIVE) {
      throw new Error('This request is not available for fulfilling');
    }

    // Get the user information for both owner and fulfiller
    const requester = await this.usersService.findOne(post.ownerId);
    const fulfiller = await this.usersService.findOne(fulfillerId);
    
    // Update the post - for requests, fulfilling means it's CLAIMED
    const updatedPost = await this.update(postId, {
      status: PostStatus.CLAIMED,
      claimerId: fulfillerId,
    });

    // Send notification email to the requester
    await this.emailService.sendRequestFulfilledEmail(
      requester.email,
      requester.name,
      post.title,
      fulfiller.name,
      post.id
    );
    
    return updatedPost;
  }

  // Method to mark a post as picked up
  async markAsPickedUp(postId: string, userId: string): Promise<FoodPost> {
    const post = await this.findOne(postId);
    
    // Verify the post is in CLAIMED status
    if (post.status !== PostStatus.CLAIMED) {
      throw new Error('This post must be claimed before it can be marked as picked up');
    }
    
    // Verify the user is either the owner or claimer
    if (post.ownerId !== userId && post.claimerId !== userId) {
      throw new Error('Only the post owner or claimer can mark it as picked up');
    }
    
    // Update the post status
    const updatedPost = await this.update(postId, {
      status: PostStatus.PICKED_UP,
    });
    
    // Get user information
    const owner = await this.usersService.findOne(post.ownerId);
    const claimer = await this.usersService.findOne(post.claimerId);
    
    // Send notification email based on who marked it as picked up
    if (userId === post.ownerId) {
      // Owner marked it as picked up, notify claimer
      await this.emailService.sendPostStatusUpdateEmail(
        claimer.email,
        claimer.name,
        post.title,
        'picked up',
        owner.name
      );
    } else {
      // Claimer marked it as picked up, notify owner
      await this.emailService.sendPostStatusUpdateEmail(
        owner.email,
        owner.name,
        post.title,
        'picked up',
        claimer.name
      );
    }
    
    return updatedPost;
  }

  // Method to mark a post as completed
  async markAsCompleted(postId: string, userId: string): Promise<FoodPost> {
    const post = await this.findOne(postId);
    
    // Verify the post is in PICKED_UP status
    if (post.status !== PostStatus.PICKED_UP) {
      throw new Error('This post must be picked up before it can be marked as completed');
    }
    
    // Verify the user is either the owner or claimer
    if (post.ownerId !== userId && post.claimerId !== userId) {
      throw new Error('Only the post owner or claimer can mark it as completed');
    }
    
    // Update the post status
    const updatedPost = await this.update(postId, {
      status: PostStatus.COMPLETED,
    });
    
    // Get user information
    const owner = await this.usersService.findOne(post.ownerId);
    const claimer = await this.usersService.findOne(post.claimerId);
    
    // Update donation and received counts based on post type
    if (post.type === PostType.DONATION) {
      // Update donation count for the owner
      await this.usersService.update(owner.id, {
        donationsCount: owner.donationsCount + 1
      });

      // Update received count for the claimer
      await this.usersService.update(claimer.id, {
        receivedCount: claimer.receivedCount + 1
      });
    } else {
      // For requests, the claimer is the donor and owner is the receiver
      await this.usersService.update(claimer.id, {
        donationsCount: claimer.donationsCount + 1
      });

      await this.usersService.update(owner.id, {
        receivedCount: owner.receivedCount + 1
      });
    }
    
    // Send notification email based on who marked it as completed
    if (userId === post.ownerId) {
      // Owner marked it as completed, notify claimer
      await this.emailService.sendPostStatusUpdateEmail(
        claimer.email,
        claimer.name,
        post.title,
        'completed',
        owner.name
      );
    } else {
      // Claimer marked it as completed, notify owner
      await this.emailService.sendPostStatusUpdateEmail(
        owner.email,
        owner.name,
        post.title,
        'completed',
        claimer.name
      );
    }
    
    return updatedPost;
  }

  /**
   * Find posts by user ID and type
   * @param userId - User ID
   * @param type - Post type (donation or request)
   * @returns Array of user posts
   */
  async findUserPosts(userId: string, type: PostType): Promise<FoodPost[]> {
    // Ensure the user exists
    await this.usersService.findOne(userId);
    
    return this.postsRepository.find({
      where: { 
        ownerId: userId,
        type: type
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  /**
   * Find posts claimed by a user
   * @param userId - User ID
   * @returns Array of claimed posts
   */
  async findClaimedPosts(userId: string): Promise<FoodPost[]> {
    // Ensure the user exists
    await this.usersService.findOne(userId);
    
    return this.postsRepository.find({
      where: { 
        claimerId: userId
      },
      relations: ['owner'],
      order: {
        updatedAt: 'DESC'
      }
    });
  }
} 