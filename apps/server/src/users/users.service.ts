import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, CreateUserDto, UserDocument } from '@repo/types';
import { UserSchema } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new this.userModel({
      email,
      username,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    return this.toUserDto(savedUser);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id);
    return user ? this.toUserDto(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.userModel.findOne({ username });
    return user ? this.toUserDto(user) : null;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserDto(user);
  }

  async updateStats(id: string, stats: Partial<User['stats']>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { stats } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserDto(user);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async validatePassword(
    user: UserDocument,
    password: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    const users = await this.userModel
      .find()
      .sort({ 'stats.rating': -1 })
      .limit(limit)
      .select('-password');

    return users.map((user) => this.toUserDto(user));
  }

  private toUserDto(user: UserDocument): User {
    const { password, ...userDto } = user.toObject();
    return userDto as User;
  }
}
