import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { createLogger } from './logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createLogger('notifications-service'),
  });

  // Enable CORS for WebSocket
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Connect RabbitMQ microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'notifications_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3004);

  console.log(`🚀 Notifications Service is running on: http://localhost:${process.env.PORT ?? 3004}`);
  console.log(`📡 WebSocket Gateway is ready`);
  console.log(`🐰 RabbitMQ Consumer is listening on notifications_queue`);
}
bootstrap();
