import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: User })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return the list of users', type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return the current user profile', type: User })
  async getProfile(@Request() req) {
    const userId = req.user.userId;
    const user = await this.usersService.findOne(userId);
    
    // Ensure the counts are returned correctly
    return {
      ...user,
      donationsCount: user.donationsCount || 0,
      receivedCount: user.receivedCount || 0
    };
  }

  @Post('profile-update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile directly without OTP verification' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: User })
  async updateProfileDirectly(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const userId = req.user.userId;
    return this.usersService.updateProfileDirectly(userId, updateUserDto);
  }

  @Post('update-profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile (legacy endpoint)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: User })
  async updateProfileWithOtp(
    @Request() req,
    @Body() body: UpdateUserDto & { otp?: string }
  ) {
    // Ignore any OTP parameters and directly update the profile
    const userId = req.user.userId;
    const { otp, ...updateUserDto } = body;
    
    // Use direct update without OTP verification
    return this.usersService.updateProfileDirectly(userId, updateUserDto);
  }

  @Post('direct-update')
  @ApiOperation({ summary: 'Update user profile without JWT authentication (legacy)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: User })
  async directProfileUpdate(
    @Body() body: UpdateUserDto & { email: string }
  ) {
    try {
      console.log('Received direct update request');
      
      // Extract data from request
      const { email, ...updateUserDto } = body;
      
      if (!email) {
        throw new Error('Email is required');
      }
      
      // Find user by email
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new Error('User not found with the provided email');
      }
      
      // Update the profile directly without OTP
      return this.usersService.updateProfileDirectly(user.id, updateUserDto);
    } catch (error) {
      console.error('Direct update error:', error.message);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 