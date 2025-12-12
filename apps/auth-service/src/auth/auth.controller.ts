import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { stat } from 'fs';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: { email: string; password: string }) {
    const user = await this.authService.validateUser(data.email, data.password);
    if (!user) {
      return { error: 'Invalid credentials', status: 401 };
    }

    return this.authService.login(user);
  }
}
