import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3003,
    },
  });
  await app.startAllMicroservices();
  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0');

  console.log(`Auth Service is running on port ${port} and TCP:3003`);
}
bootstrap();
