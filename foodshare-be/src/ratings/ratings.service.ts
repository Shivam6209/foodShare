import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { FoodPost } from '../posts/entities/food-post.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { PostStatus } from '../common/enums/post-status.enum';
import { EmailService } from '../email/email.service';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
    @InjectRepository(FoodPost)
    private postsRepository: Repository<FoodPost>,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async create(createRatingDto: CreateRatingDto, raterUserId: string): Promise<Rating> {
    // Check if post exists and is completed
    const post = await this.postsRepository.findOne({
      where: { id: createRatingDto.postId },
      relations: ['owner', 'claimer'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== PostStatus.COMPLETED) {
      throw new BadRequestException('Can only rate completed posts');
    }

    // Verify the rater is either the owner or claimer
    if (post.ownerId !== raterUserId && post.claimerId !== raterUserId) {
      throw new BadRequestException('Only the post owner or claimer can leave a rating');
    }

    // Verify the rated user is valid (the other party in the transaction)
    if (createRatingDto.ratedUserId !== post.ownerId && createRatingDto.ratedUserId !== post.claimerId) {
      throw new BadRequestException('Can only rate users involved in this post');
    }

    // Check if a rating already exists for this user and post combination
    const existingRating = await this.ratingsRepository.findOne({
      where: {
        raterUserId,
        ratedUserId: createRatingDto.ratedUserId,
        postId: createRatingDto.postId,
      },
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this user for this post');
    }

    // Create the rating
    const rating = this.ratingsRepository.create({
      ...createRatingDto,
      raterUserId,
    });

    const savedRating = await this.ratingsRepository.save(rating);

    // Update user's average rating
    await this.updateUserRating(createRatingDto.ratedUserId);

    // Send notification email
    const ratedUser = await this.usersService.findOne(createRatingDto.ratedUserId);
    const raterUser = await this.usersService.findOne(raterUserId);

    // Send email notification about new rating
    await this.emailService.sendEmail(
      ratedUser.email,
      ratedUser.name,
      `You received a ${createRatingDto.value}-star rating on FoodShare`,
      `
        <h1>You've received a rating!</h1>
        <p>Hello ${ratedUser.name},</p>
        <p>${raterUser.name} has left you a ${createRatingDto.value}-star rating for ${post.title}.</p>
        ${createRatingDto.comment ? `<p>Their comment: "${createRatingDto.comment}"</p>` : ''}
        <p>Thank you for using FoodShare!</p>
      `
    );

    return savedRating;
  }

  /**
   * Update a user's average rating
   * @param userId - ID of the user to update
   */
  private async updateUserRating(userId: string): Promise<void> {
    // Get all ratings for this user
    const ratingsResult = await this.ratingsRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.value)', 'average')
      .where('rating.ratedUserId = :userId', { userId })
      .getRawOne();

    const averageRating = parseFloat(ratingsResult.average) || 0;

    // Update the user's average rating
    await this.usersService.update(userId, { 
      rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
    });
  }

  /**
   * Get all ratings for a user
   * @param userId - ID of the user 
   */
  async findUserRatings(userId: string): Promise<Rating[]> {
    return this.ratingsRepository.find({
      where: { ratedUserId: userId },
      relations: ['raterUser', 'post'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Check if a user has already been rated for a specific post
   * @param raterUserId - ID of the user who rates
   * @param ratedUserId - ID of the user being rated
   * @param postId - ID of the post
   */
  async hasRated(raterUserId: string, ratedUserId: string, postId: string): Promise<boolean> {
    const count = await this.ratingsRepository.count({
      where: {
        raterUserId,
        ratedUserId,
        postId,
      },
    });
    
    return count > 0;
  }
} 