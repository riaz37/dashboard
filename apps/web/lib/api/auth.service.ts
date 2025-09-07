import { api } from '@/lib/api';
import { 
  User, 
  AuthResponse, 
  LoginDto, 
  CreateUserDto, 
  ApiResponse 
} from '@repo/types';

export class AuthService {
  static async login(data: LoginDto): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/login', data);
    return response.data;
  }

  static async register(data: CreateUserDto): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  static async refresh(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  static async logout(): Promise<ApiResponse<void>> {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  static async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/profile');
    return response.data;
  }
}
