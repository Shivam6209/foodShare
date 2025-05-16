import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new rating' })
  @ApiResponse({ status: 201, description: 'Rating created successfully', type: Rating })
  create(@Body() createRatingDto: CreateRatingDto, @Request() req) {
    return this.ratingsService.create(createRatingDto, req.user.userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all ratings for a user' })
  @ApiResponse({ status: 200, description: 'Returns all ratings for a user', type: [Rating] })
  findUserRatings(@Param('userId') userId: string) {
    return this.ratingsService.findUserRatings(userId);
  }

  @Get('check/:postId/:ratedUserId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check if the user has already rated another user for a post' })
  @ApiResponse({ status: 200, description: 'Returns whether the user has already rated', type: Boolean })
  async checkRating(
    @Param('postId') postId: string,
    @Param('ratedUserId') ratedUserId: string,
    @Request() req,
  ) {
    const hasRated = await this.ratingsService.hasRated(req.user.userId, ratedUserId, postId);
    return { hasRated };
  }
} 