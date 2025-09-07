import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  CreateUserDto,
  AuthResponse,
  ApiResponse,
} from '@repo/types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const user = await this.usersService.create(createUserDto);
      const authResponse = await this.authService.login({
        email: createUserDto.email,
        password: createUserDto.password,
      });

      return {
        success: true,
        data: authResponse,
        message: 'User registered successfully',
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

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<AuthResponse>> {
    try {
      const authResponse = await this.authService.login(loginDto);
      return {
        success: true,
        data: authResponse,
        message: 'Login successful',
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

  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<ApiResponse<{ accessToken: string }>> {
    try {
      const result = await this.authService.refreshToken(refreshToken);
      return {
        success: true,
        data: result,
        message: 'Token refreshed successfully',
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
  async getProfile(@Request() req): Promise<ApiResponse<any>> {
    try {
      const user = await this.authService.validateUserById(req.user.id);
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

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(): Promise<ApiResponse<void>> {
    // In a real application, you might want to blacklist the token
    return {
      success: true,
      message: 'Logout successful',
      timestamp: new Date(),
    };
  }
}
