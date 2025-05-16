import { Controller, Post, Body, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EmailAuthGuard } from './guards/email-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login with password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() credentials: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      credentials.email,
      credentials.password
    );
    return this.authService.login(user);
  }

  @Post('login/email')
  @ApiOperation({ summary: 'User login with email verification code' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async emailLogin(@Body() body: { email: string; otp: string }) {
    const user = await this.authService.validateLoginToken(body.otp, body.email);
    return this.authService.login(user);
  }

  @Post('request-login-email')
  @ApiOperation({ summary: 'Request a login verification code' })
  @ApiResponse({ status: 200, description: 'Login verification code sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async requestLoginEmail(@Body('email') email: string) {
    return this.authService.requestLoginEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout() {
    // JWT is stateless, so we just return success
    // In a real app, you might blacklist the token or perform other cleanup
    return { success: true, message: 'Logged out successfully' };
  }

  @Post('check-email-available')
  @ApiOperation({ summary: 'Check if email is available for registration' })
  @ApiResponse({ status: 200, description: 'Email availability status' })
  async checkEmailAvailable(@Body('email') email: string) {
    return this.authService.checkEmailAvailable(email);
  }

  @Post('request-verification')
  @ApiOperation({ summary: 'Request a verification code for email' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async requestVerification(@Body('email') email: string) {
    return this.authService.requestVerification(email);
  }

  @Post('verify-email-otp')
  @ApiOperation({ summary: 'Verify email with OTP code (without registering)' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyEmailOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyEmailOtp(body.otp, body.email);
  }

  @Post('register-verified')
  @ApiOperation({ summary: 'Register a user with verified email' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async registerVerified(@Body() body: CreateUserDto & { verificationCode: string }) {
    const { verificationCode, ...createUserDto } = body;
    return this.authService.registerVerified(createUserDto, verificationCode);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration (legacy)' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with OTP code (legacy)' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyEmail(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyEmail(body.otp, body.email);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification code (legacy)' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile data', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }
} 