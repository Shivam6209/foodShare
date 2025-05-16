import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FoodPost } from '../../posts/entities/food-post.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.ratingsReceived)
  @JoinColumn({ name: 'ratedUserId' })
  ratedUser: User;

  @Column()
  ratedUserId: string;

  @ManyToOne(() => User, (user) => user.ratingsGiven)
  @JoinColumn({ name: 'raterUserId' })
  raterUser: User;

  @Column()
  raterUserId: string;

  @ManyToOne(() => FoodPost)
  @JoinColumn({ name: 'postId' })
  post: FoodPost;

  @Column()
  postId: string;

  @Column({ type: 'int' })
  value: number;

  @Column({ nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
} 