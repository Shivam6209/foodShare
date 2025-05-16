import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class EmailStrategy extends PassportStrategy(Strategy, 'email') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const { token, email } = req.body;
    
    if (!token) {
      throw new UnauthorizedException('Email verification token is required');
    }

    if (!email) {
      throw new UnauthorizedException('Email is required');
    }
    
    try {
      // Validate the login token
      const user = await this.authService.validateLoginToken(token, email);
      return user;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid email verification token');
    }
  }
} 