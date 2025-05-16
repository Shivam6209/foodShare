import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { PostsService } from './posts/posts.service';
import { PostType } from './common/enums/post-type.enum';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed script to populate the database with initial data
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const usersService = app.get(UsersService);
  const postsService = app.get(PostsService);

  try {
    // Create users
    const users = await Promise.all([
      usersService.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?u=jane',
      }),
      usersService.create({
        name: 'John Smith',
        email: 'john@example.com',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?u=john',
      }),
      usersService.create({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?u=alice',
      }),
    ]);

    console.log(`Created ${users.length} users`);

    // Create posts
    const posts = await Promise.all([
      postsService.create({
        type: PostType.DONATION,
        title: 'Fresh vegetables from garden',
        description: 'Extra vegetables from my garden: tomatoes, cucumbers, and lettuce.',
        quantity: '5 lbs assorted',
        location: '123 Main St, Anytown, USA',
        expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        ownerId: users[0].id,
      }),
      postsService.create({
        type: PostType.REQUEST,
        title: 'Need bread and milk',
        description: 'Family in need of basic groceries.',
        quantity: 'Any amount helps',
        location: '456 Oak St, Anytown, USA',
        expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        ownerId: users[1].id,
      }),
      postsService.create({
        type: PostType.DONATION,
        title: 'Leftover birthday cake',
        description: 'Half a birthday cake, chocolate with vanilla frosting.',
        quantity: '1 cake (half)',
        location: '789 Pine St, Anytown, USA',
        expiryDate: new Date(Date.now() + 86400000 * 1).toISOString(), // 1 day from now
        ownerId: users[2].id,
      }),
      postsService.create({
        type: PostType.DONATION,
        title: 'Canned goods clearance',
        description: 'Moving out, need to get rid of canned beans, corn, and soup.',
        quantity: '10 cans',
        location: '101 River Rd, Anytown, USA',
        expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
        ownerId: users[0].id,
      }),
      postsService.create({
        type: PostType.REQUEST,
        title: 'Food for community event',
        description: 'Looking for food donations for neighborhood picnic.',
        quantity: 'Any contributions welcome',
        location: '202 Park Ave, Anytown, USA',
        expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
        ownerId: users[2].id,
      }),
    ]);

    console.log(`Created ${posts.length} posts`);

    // Mark one post as claimed
    await postsService.claimDonation(posts[2].id, users[1].id);
    console.log('Updated post status to claimed');

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 