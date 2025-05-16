import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Claim } from '../../claims/entities/claim.entity';
import { PostType } from '../../common/enums/post-type.enum';
import { PostStatus } from '../../common/enums/post-status.enum';

@Entity('food_posts')
export class FoodPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PostType,
  })
  type: PostType;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  quantity: string;

  @Column()
  location: string;

  @Column()
  expiryDate: Date;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.ACTIVE,
  })
  status: PostStatus;

  @Column({ nullable: true })
  urgency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @Column()
  ownerId: string;

  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ nullable: true })
  claimerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'claimerId' })
  claimer: User;

  @OneToMany(() => Claim, claim => claim.post)
  claims: Claim[];
} 