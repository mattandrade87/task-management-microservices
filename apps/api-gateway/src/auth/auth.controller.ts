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
import { LoginDto, RegisterDto, RefreshTokenDto } from '@repo/types';
import { UseGuards, Get, Request } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful. Returns access token, refresh token and user information.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'a1b2c3d4e5f6...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          username: 'johndoe'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        password: 'password123'
      }
    }
  })
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

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration successful. Returns access token, refresh token and user information.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'a1b2c3d4e5f6...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          username: 'johndoe'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Email or username already in use' })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        username: 'johndoe',
        password: 'password123'
      }
    }
  })
  async register(@Body() registerDto: RegisterDto) {
    const result = await lastValueFrom(
      this.authClient.send('register', registerDto),
    );

    if (result && result.error) {
      throw new HttpException(
        result.error,
        result.status || HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refresh successful. Returns new access token.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiBody({
    schema: {
      example: {
        refresh_token: 'a1b2c3d4e5f6...'
      }
    }
  })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    const result = await lastValueFrom(
      this.authClient.send('refresh', refreshDto),
    );

    if (result && result.error) {
      throw new HttpException(
        result.error,
        result.status || HttpStatus.UNAUTHORIZED,
      );
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully.',
    schema: {
      example: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  getProfile(@Request() req) {
    // Se chegar aqui, o token é válido.
    // O req.user foi populado pelo método validate() da JwtStrategy
    return req.user;
  }
}
