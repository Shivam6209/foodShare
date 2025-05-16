import { IsString, IsInt, IsUUID, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ description: 'User ID who is being rated' })
  @IsUUID()
  ratedUserId: string;

  @ApiProperty({ description: 'Food post ID this rating is for' })
  @IsUUID()
  postId: string;

  @ApiProperty({ description: 'Rating value (1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  value: number;

  @ApiProperty({ description: 'Optional comment with the rating', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
} 