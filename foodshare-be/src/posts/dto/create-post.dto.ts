import { IsNotEmpty, IsString, IsEnum, IsDateString, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PostType } from '../../common/enums/post-type.enum';

export class CreatePostDto {
  @ApiProperty({ description: 'Post type (donation or request)', enum: PostType })
  @IsEnum(PostType)
  type: PostType;

  @ApiProperty({ description: 'Post title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Post description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Food quantity' })
  @IsString()
  @IsNotEmpty()
  quantity: string;

  @ApiProperty({ description: 'Location address string' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Expiry date' })
  @IsDateString()
  expiryDate: string;

  @ApiPropertyOptional({ description: 'Urgency level (for requests only)' })
  @IsOptional()
  @IsString()
  urgency?: string;

  @ApiProperty({ description: 'Owner user ID' })
  @IsString()
  @IsNotEmpty()
  ownerId: string;
} 