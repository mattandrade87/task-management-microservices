import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API Gateway health status' })
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () =>
        this.microservice.pingCheck('auth-service', {
          transport: Transport.TCP,
          options: {
            host: process.env.AUTH_SERVICE_HOST || 'auth-service',
            port: parseInt(process.env.AUTH_SERVICE_PORT || '3003'),
          },
        }),
      () =>
        this.microservice.pingCheck('tasks-service', {
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
            queue: 'tasks_queue',
          },
        }),
    ]);
  }
}
