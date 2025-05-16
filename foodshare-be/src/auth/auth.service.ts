import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from '../users/dto/create-user.dto';

interface PendingRegistration {
  createUserDto: CreateUserDto;
  hashedPassword: string;
  otp: string;
  expiry: Date;
}

@Injectable()
export class AuthService {
  // Map to store pending registrations - email as key
  private pendingRegistrations: Map<string, PendingRegistration> = new Map();

  // Map to store email verification state
  private verifiedEmails: Map<string, { otp: string; expiry: Date }> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  // Generate a random 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async validateUser(email: string, password: string): Promise<any> {
    // User.findOne is modified to include password for auth purposes
    try {
      const user = await this.usersService.findByEmail(email, true);
      
      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Check if user with this email already exists
    try {
      const existingUser = await this.usersService.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
      // If NotFoundException is thrown, it means the user doesn't exist, which is what we want
    }

    // Check if there's already a pending registration for this email
    const existingPending = this.pendingRegistrations.get(createUserDto.email);
    if (existingPending) {
      // Update existing pending registration with new OTP
      const otp = this.generateOTP();
      const now = new Date();
      const expiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

      // Hash the password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      // Update the pending registration
      this.pendingRegistrations.set(createUserDto.email, {
        createUserDto,
        hashedPassword,
        otp,
        expiry
      });

      // Send verification email with OTP
      await this.emailService.sendVerificationOTP(
        createUserDto.email,
        createUserDto.name,
        otp
      );

      return {
        message: 'Verification code resent to your email',
        email: createUserDto.email
      };
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Generate OTP
    const otp = this.generateOTP();
    const now = new Date();
    const expiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
    
    // Store pending registration instead of creating user right away
    this.pendingRegistrations.set(createUserDto.email, {
      createUserDto,
      hashedPassword,
      otp,
      expiry
    });
    
    // Send verification email with OTP
    await this.emailService.sendVerificationOTP(
      createUserDto.email,
      createUserDto.name,
      otp
    );
    
    return {
      message: 'Verification code sent to your email',
      email: createUserDto.email
    };
  }

  async verifyEmail(otp: string, email: string) {
    if (!otp) {
      throw new BadRequestException('Verification code is required');
    }

    if (!email) {
      throw new BadRequestException('Email is required');
    }
    
    // Check if this is a pending registration
    const pendingRegistration = this.pendingRegistrations.get(email);
    
    if (pendingRegistration) {
      // Verify the OTP for pending registration
      if (pendingRegistration.otp !== otp) {
        throw new BadRequestException('Invalid verification code');
      }
      
      // Check if OTP is expired
      const now = new Date();
      if (pendingRegistration.expiry < now) {
        throw new BadRequestException('Verification code has expired');
      }
      
      // Create the user with verified status
      const user = await this.usersService.create({
        ...pendingRegistration.createUserDto,
        password: pendingRegistration.hashedPassword,
        isEmailVerified: true, // Set as verified immediately
        verificationToken: null,
        verificationTokenExpiry: null,
      });
      
      // Remove from pending registrations
      this.pendingRegistrations.delete(email);
      
      // Log the user in
      const { password, ...userResult } = user;
      return this.login(userResult);
    } else {
      // Attempt to verify an existing user (for backward compatibility)
      try {
        const existingUser = await this.usersService.findByEmail(email);
        
        if (existingUser.isEmailVerified) {
          return { message: 'Email already verified' };
        }

        if (existingUser.verificationToken !== otp) {
          throw new BadRequestException('Invalid verification code');
        }
        
        // Check if OTP is expired
        const now = new Date();
        if (existingUser.verificationTokenExpiry && existingUser.verificationTokenExpiry < now) {
          throw new BadRequestException('Verification code has expired');
        }
        
        // Mark email as verified and clear OTP
        await this.usersService.update(existingUser.id, {
          isEmailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
        });
        
        // Log the user in after verification
        const { password, ...userResult } = existingUser;
        return this.login(userResult);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException('No pending registration found with this email');
        }
        throw error;
      }
    }
  }

  async requestLoginEmail(email: string) {
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Request login email for: ${normalizedEmail}`);

    try {
      const user = await this.usersService.findByEmail(normalizedEmail);
      
      if (!user) {
        console.log(`User not found with email: ${normalizedEmail}`);
        throw new BadRequestException('User not found with this email');
      }
      
      if (!user.isEmailVerified) {
        console.log(`Unverified email attempted login: ${normalizedEmail}`);
        throw new BadRequestException('Email is not verified. Please verify your email first.');
      }
      
      // Generate OTP
      const otp = this.generateOTP();
      const now = new Date();
      const expiry = new Date(now.getTime() + 30 * 60 * 1000); // Extend to 30 minutes
      
      console.log(`Generated OTP: ${otp} for ${normalizedEmail}, expires at ${expiry}`);
      
      // Update user with OTP
      await this.usersService.update(user.id, {
        verificationToken: otp,
        verificationTokenExpiry: expiry,
      });
      
      // Send login email with OTP
      const sent = await this.emailService.sendLoginOTP(
        user.email,
        user.name,
        otp
      );
      
      if (!sent) {
        console.log(`Failed to send login email to ${normalizedEmail}`);
        throw new BadRequestException('Failed to send login email');
      }
      
      console.log(`Login verification code sent successfully to ${normalizedEmail}`);
      
      return { 
        message: 'Login verification code sent successfully',
        email: user.email
      };
    } catch (error) {
      console.error(`Error requesting login email: ${error.message}`, error);
      throw error;
    }
  }

  async validateLoginToken(otp: string, email: string) {
    if (!otp) {
      throw new BadRequestException('Verification code is required');
    }

    if (!email) {
      throw new BadRequestException('Email is required');
    }
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Validating login token for email: ${normalizedEmail}, OTP: ${otp}`);
    
    try {
      const user = await this.usersService.findByEmail(normalizedEmail);
      
      if (!user) {
        console.log(`User not found for email: ${normalizedEmail}`);
        throw new UnauthorizedException('User not found');
      }

      console.log(`User found. Stored verification token: ${user.verificationToken}, provided OTP: ${otp}`);
      
      // Make OTP comparison case-insensitive
      if (!user.verificationToken || user.verificationToken.toLowerCase() !== otp.toLowerCase()) {
        console.log('Invalid verification code provided');
        throw new UnauthorizedException('Invalid verification code');
      }
      
      // Check if OTP is expired
      const now = new Date();
      if (user.verificationTokenExpiry && user.verificationTokenExpiry < now) {
        console.log(`OTP expired at ${user.verificationTokenExpiry}, current time: ${now}`);
        throw new UnauthorizedException('Verification code has expired');
      }
      
      console.log('OTP validation successful, clearing OTP from user record');
      
      // Clear OTP
      await this.usersService.update(user.id, {
        verificationToken: null,
        verificationTokenExpiry: null,
      });
      
      // Return user without sensitive data
      const { password, verificationToken, ...result } = user;
      
      return result;
    } catch (error) {
      console.error('OTP validation error:', error);
      throw error;
    }
  }

  async resendVerificationEmail(email: string) {
    // Check if there's a pending registration
    const pendingRegistration = this.pendingRegistrations.get(email);
    
    if (pendingRegistration) {
      // Generate new OTP
      const otp = this.generateOTP();
      const now = new Date();
      const expiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
      
      // Update the pending registration with new OTP
      this.pendingRegistrations.set(email, {
        ...pendingRegistration,
        otp,
        expiry
      });
      
      // Send verification email with OTP
      await this.emailService.sendVerificationOTP(
        email,
        pendingRegistration.createUserDto.name,
        otp
      );
      
      return { 
        message: 'Verification code sent',
        email
      };
    } else {
      // Fall back to existing user verification (for backward compatibility)
      try {
        const existingUser = await this.usersService.findByEmail(email);
        
        if (existingUser.isEmailVerified) {
          throw new BadRequestException('Email is already verified');
        }
        
        // Generate new OTP
        const otp = this.generateOTP();
        const now = new Date();
        const expiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
        
        // Update user with new OTP
        await this.usersService.update(existingUser.id, {
          verificationToken: otp,
          verificationTokenExpiry: expiry,
        });
        
        // Send verification email with OTP
        await this.emailService.sendVerificationOTP(
          existingUser.email,
          existingUser.name,
          otp
        );
        
        return { 
          message: 'Verification code sent',
          email: existingUser.email
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException('No registration found with this email');
        }
        throw error;
      }
    }
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }

  async checkEmailAvailable(email: string): Promise<{ available: boolean; message?: string }> {
    try {
      await this.usersService.findByEmail(email);
      // If we get here, user exists
      return { available: false, message: 'Email is already registered' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Check if there's a pending registration
        const pendingRegistration = this.pendingRegistrations.get(email);
        if (pendingRegistration) {
          return { available: false, message: 'Email has a pending registration' };
        }
        return { available: true };
      }
      throw error;
    }
  }

  async requestVerification(email: string) {
    // Generate OTP
    const otp = this.generateOTP();
    const now = new Date();
    const expiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
    
    // Store verification state
    this.verifiedEmails.set(email, { otp, expiry });
    
    // Send verification email
    await this.emailService.sendVerificationOTP(
      email,
      'User', // Generic name since we don't have it yet
      otp
    );
    
    return {
      message: 'Verification code sent to your email',
      email
    };
  }

  async verifyEmailOtp(otp: string, email: string) {
    if (!otp) {
      throw new BadRequestException('Verification code is required');
    }

    if (!email) {
      throw new BadRequestException('Email is required');
    }
    
    // Get verification state
    const verification = this.verifiedEmails.get(email);
    if (!verification) {
      throw new BadRequestException('No verification code found for this email');
    }
    
    // Verify OTP
    if (verification.otp !== otp) {
      throw new BadRequestException('Invalid verification code');
    }
    
    // Check if expired
    const now = new Date();
    if (verification.expiry < now) {
      throw new BadRequestException('Verification code has expired');
    }
    
    // At this point, email is verified, but we keep the verification state for registration
    return {
      verified: true,
      message: 'Email verified successfully'
    };
  }

  async registerVerified(createUserDto: CreateUserDto, verificationCode: string) {
    // Check if email is verified
    const email = createUserDto.email;
    const verification = this.verifiedEmails.get(email);
    
    if (!verification) {
      throw new BadRequestException('Email has not been verified');
    }
    
    if (verification.otp !== verificationCode) {
      throw new BadRequestException('Invalid verification code');
    }
    
    // Check if expired
    const now = new Date();
    if (verification.expiry < now) {
      throw new BadRequestException('Verification code has expired');
    }
    
    // Check if user already exists
    try {
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
      // If NotFoundException, user doesn't exist, which is good
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Create the user with verified status
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
      isEmailVerified: true, // Set as verified immediately
      verificationToken: null,
      verificationTokenExpiry: null,
    });
    
    // Remove from verified emails
    this.verifiedEmails.delete(email);
    
    // Log the user in
    const { password, ...userResult } = user;
    return this.login(userResult);
  }
} 