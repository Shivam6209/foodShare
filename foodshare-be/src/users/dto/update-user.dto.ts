import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsNumber, Min, Max, IsBoolean, IsString, IsDate } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Current password (required when updating password)' })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiPropertyOptional({ description: 'User rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Number of donations made' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  donationsCount?: number;

  @ApiPropertyOptional({ description: 'Number of donations received' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  receivedCount?: number;

  @ApiPropertyOptional({ description: 'Whether the email is verified' })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ description: 'Email verification token' })
  @IsOptional()
  @IsString()
  verificationToken?: string;

  @ApiPropertyOptional({ description: 'Email verification token expiry date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  verificationTokenExpiry?: Date;

  @ApiPropertyOptional({ description: 'Password reset token' })
  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @ApiPropertyOptional({ description: 'Password reset token expiry date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  passwordResetTokenExpiry?: Date;
} 