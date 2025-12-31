import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createLogger } from './logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createLogger('auth-service'),
  });
  app.enableCors();

  const tcpPort = parseInt(process.env.TCP_PORT || '3003') || 3003;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: tcpPort,
    },
  });
  await app.startAllMicroservices();
  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0');

  console.log(`Auth Service is running on port ${port} and TCP:${tcpPort}`);
}
bootstrap();
