import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FoodPost } from './entities/food-post.entity';
import { PostType } from '../common/enums/post-type.enum';
import { PostStatus } from '../common/enums/post-status.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new food post' })
  @ApiResponse({ status: 201, description: 'The post has been successfully created.', type: FoodPost })
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    createPostDto.ownerId = req.user.userId;
    return this.postsService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all food posts with optional filtering' })
  @ApiResponse({ status: 200, description: 'Return the list of posts', type: [FoodPost] })
  @ApiQuery({ name: 'type', enum: PostType, required: false })
  @ApiQuery({ name: 'status', enum: PostStatus, required: false })
  @ApiQuery({ name: 'expiryFilter', enum: ['soon', 'all'], required: false })
  findAll(
    @Query('type') type?: PostType,
    @Query('status') status?: PostStatus,
    @Query('expiryFilter') expiryFilter?: 'soon' | 'all',
  ) {
    return this.postsService.findAll(type, status, expiryFilter);
  }

  @Get('my-donations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user donations' })
  @ApiResponse({ status: 200, description: 'Return the list of user donations', type: [FoodPost] })
  getUserDonations(@Request() req) {
    return this.postsService.findUserPosts(req.user.userId, PostType.DONATION);
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user requests' })
  @ApiResponse({ status: 200, description: 'Return the list of user requests', type: [FoodPost] })
  getUserRequests(@Request() req) {
    return this.postsService.findUserPosts(req.user.userId, PostType.REQUEST);
  }

  @Get('my-claims')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user claimed posts' })
  @ApiResponse({ status: 200, description: 'Return the list of claimed posts', type: [FoodPost] })
  getUserClaimedPosts(@Request() req) {
    return this.postsService.findClaimedPosts(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a food post by id' })
  @ApiResponse({ status: 200, description: 'Return the post', type: FoodPost })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a food post' })
  @ApiResponse({ status: 200, description: 'The post has been successfully updated.', type: FoodPost })
  @ApiResponse({ status: 404, description: 'Post not found' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a food post' })
  @ApiResponse({ status: 200, description: 'The post has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete post with non-active status' })
  async remove(@Param('id') id: string, @Request() req) {
    try {
      const post = await this.postsService.findOne(id);
      
      // Check if user is the owner of the post
      if (post.ownerId !== req.user.userId) {
        throw new Error('You can only delete your own posts');
      }
      
      return await this.postsService.remove(id);
    } catch (error) {
      // Re-throw the error so it can be handled by exception filters
      throw error;
    }
  }

  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Claim a donation' })
  @ApiResponse({ status: 200, description: 'The donation has been successfully claimed.', type: FoodPost })
  @ApiResponse({ status: 404, description: 'Post not found' })
  claim(@Param('id') id: string, @Request() req) {
    return this.postsService.claimDonation(id, req.user.userId);
  }

  @Post(':id/fulfill')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fulfill a request' })
  @ApiResponse({ status: 200, description: 'The request has been successfully completed.', type: FoodPost })
  @ApiResponse({ status: 404, description: 'Post not found' })
  fulfill(@Param('id') id: string, @Request() req) {
    return this.postsService.fulfillRequest(id, req.user.userId);
  }

  @Post(':id/pickup')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark a post as picked up' })
  @ApiResponse({ status: 200, description: 'The post has been marked as picked up.', type: FoodPost })
  @ApiResponse({ status: 404, description: 'Post not found' })
  markAsPickedUp(@Param('id') id: string, @Request() req) {
    return this.postsService.markAsPickedUp(id, req.user.userId);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark a post as completed' })
  @ApiResponse({ status: 200, description: 'The post has been marked as completed.', type: FoodPost })
  @ApiResponse({ status: 404, description: 'Post not found' })
  markAsCompleted(@Param('id') id: string, @Request() req) {
    return this.postsService.markAsCompleted(id, req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update the status of a food post' })
  @ApiResponse({ status: 200, description: 'The status has been successfully updated.', type: FoodPost })
  @ApiResponse({ status: 404, description: 'Post not found' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: PostStatus,
  ) {
    return this.postsService.updateStatus(id, status);
  }
} 