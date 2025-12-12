import {
  Controller,
  Post,
  Body,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { LoginDto } from '@repo/types';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await lastValueFrom(this.authClient.send('login', loginDto));

    if (result && result.error) {
      throw new HttpException(
        result.error,
        result.status || HttpStatus.UNAUTHORIZED,
      );
    }

    return result;
  }
}
