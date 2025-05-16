import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Claim } from '../../claims/entities/claim.entity';
import { Rating } from '../../ratings/entities/rating.entity';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Don't return password in queries by default
  password: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: 0 })
  donationsCount: number;

  @Column({ default: 0 })
  receivedCount: number;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, select: false })
  verificationToken?: string;

  @Column({ nullable: true })
  verificationTokenExpiry?: Date;

  @Column({ nullable: true, select: false })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetTokenExpiry?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Post, post => post.owner)
  posts: Post[];

  @OneToMany(() => Claim, claim => claim.claimer)
  claims: Claim[];

  @OneToMany(() => Rating, rating => rating.raterUser)
  ratingsGiven: Rating[];

  @OneToMany(() => Rating, rating => rating.ratedUser)
  ratingsReceived: Rating[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
} 