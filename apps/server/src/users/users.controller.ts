import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, User, ApiResponse } from '@repo/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.create(createUserDto);
      return {
        success: true,
        data: user,
        message: 'User created successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.findById(req.user.id);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          timestamp: new Date(),
        };
      }
      return {
        success: true,
        data: user,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateData: Partial<User>,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.update(req.user.id, updateData);
      return {
        success: true,
        data: user,
        message: 'Profile updated successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit') limit?: number,
  ): Promise<ApiResponse<User[]>> {
    try {
      const users = await this.usersService.getLeaderboard(limit || 10);
      return {
        success: true,
        data: users,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.findById(id);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          timestamp: new Date(),
        };
      }
      return {
        success: true,
        data: user,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    try {
      await this.usersService.delete(id);
      return {
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}
