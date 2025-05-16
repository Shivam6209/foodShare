import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create({
      ...createUserDto,
      donationsCount: 0,
      receivedCount: 0,
      rating: 0,
    });
    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string, includePassword: boolean = false): Promise<User> {
    console.log(`Finding user by email: ${email}, includePassword: ${includePassword}`);
    
    const normalizedEmail = email.toLowerCase().trim();
    const query = this.usersRepository.createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email: normalizedEmail })
      .addSelect('user.verificationToken')
      .addSelect('user.verificationTokenExpiry');
    
    // Only include password field if explicitly requested
    if (includePassword) {
      query.addSelect('user.password');
    }
    
    console.log(`SQL query: ${query.getSql()}`);
    
    const user = await query.getOne();
    
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }
    
    console.log(`User found: ${user.id}, has verification token: ${!!user.verificationToken}`);
    
    return user;
  }

  async findByVerificationToken(token: string): Promise<User> {
    const query = this.usersRepository.createQueryBuilder('user')
      .where('user.verificationToken = :token', { token })
      .addSelect('user.verificationToken');
    
    const user = await query.getOne();
    
    if (!user) {
      throw new NotFoundException(`User with verification token not found`);
    }
    
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    // If password is being updated, hash it
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  /**
   * Update user profile without OTP verification (for authenticated users)
   */
  async updateProfileDirectly(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(userId);
    
    // If password is being updated, hash it
    if (updateUserDto.password) {
      // Hash new password
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    // Remove currentPassword from update data if present
    if (updateUserDto.currentPassword) {
      delete updateUserDto.currentPassword;
    }
    
    // Update user data
    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  /**
   * Update user profile with OTP verification
   */
  async updateProfileWithOtp(
    userId: string, 
    updateUserDto: UpdateUserDto, 
    otp: string
  ): Promise<User> {
    const user = await this.findOne(userId);
    
    // Verify the OTP
    if (!user.verificationToken || user.verificationToken !== otp) {
      throw new UnauthorizedException('Invalid verification code');
    }
    
    // Check if OTP has expired
    if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
      throw new UnauthorizedException('Verification code has expired');
    }
    
    // If password is being updated, hash it
    if (updateUserDto.password) {
      // Hash new password - no current password required since we verified with OTP
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    // Remove currentPassword from update data if present
    if (updateUserDto.currentPassword) {
      delete updateUserDto.currentPassword;
    }
    
    // Clear verification token after use
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    
    // Update user data
    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }
} 