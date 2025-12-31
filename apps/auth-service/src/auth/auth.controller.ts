import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @MessagePattern('login')
  async login(@Payload() data: { email: string; password: string }) {
    const user = await this.authService.validateUser(data.email, data.password);
    if (!user) {
      return { error: 'Invalid credentials', status: 401 };
    }

    return this.authService.login(user);
  }

  @MessagePattern('register')
  async register(@Payload() data: { email: string; username: string; password: string }) {
    try {
      const user = await this.usersService.create(data);
      const { password, ...userWithoutPassword } = user;
      
      // Login automatically after registration
      return this.authService.login(userWithoutPassword);
    } catch (error) {
      return { 
        error: error.message || 'Registration failed', 
        status: error.status || 400 
      };
    }
  }

  @MessagePattern('refresh')
  async refresh(@Payload() data: { refresh_token: string }) {
    try {
      return await this.authService.refresh(data.refresh_token);
    } catch (error) {
      return { 
        error: error.message || 'Invalid refresh token', 
        status: 401 
      };
    }
  }
}
