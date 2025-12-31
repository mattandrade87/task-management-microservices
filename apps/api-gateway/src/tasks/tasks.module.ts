import { Module } from '@nestjs/common';
import { ClientsModule, Transport, ClientProvider } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksController } from './tasks.controller';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'TASKS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService): ClientProvider => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get('RABBITMQ_URL') || 'amqp://admin:admin@rabbitmq:5672',
            ],
            queue: 'tasks_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [TasksController],
})
export class TasksModule {}
