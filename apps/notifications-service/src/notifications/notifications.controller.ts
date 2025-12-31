import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

interface TaskCreatedEvent {
  taskId: string;
  title: string;
  createdById: string;
  assigneeIds: string[];
}

interface TaskUpdatedEvent {
  taskId: string;
  title: string;
  updatedById: string;
  assigneeIds: string[];
  changes: any;
}

interface CommentCreatedEvent {
  taskId: string;
  commentId: string;
  text: string;
  authorId: string;
  taskTitle?: string;
  assigneeIds?: string[];
}

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @EventPattern('task.created')
  async handleTaskCreated(@Payload() data: TaskCreatedEvent) {
    this.logger.log(`Received task.created event: ${JSON.stringify(data)}`);

    // Notificar todos os assignees (exceto o criador)
    const usersToNotify = data.assigneeIds.filter(
      (id) => id !== data.createdById,
    );

    for (const userId of usersToNotify) {
      const notification = await this.notificationsService.create({
        type: NotificationType.TASK_CREATED,
        message: `Nova tarefa atribuída a você: ${data.title}`,
        userId,
        taskId: data.taskId,
      });

      // Emitir notificação via WebSocket
      this.notificationsGateway.sendNotificationToUser(userId, notification);
    }
  }

  @EventPattern('task.updated')
  async handleTaskUpdated(@Payload() data: TaskUpdatedEvent) {
    this.logger.log(`Received task.updated event: ${JSON.stringify(data)}`);

    // Notificar todos os assignees (exceto quem atualizou)
    const usersToNotify = data.assigneeIds.filter(
      (id) => id !== data.updatedById,
    );

    for (const userId of usersToNotify) {
      const notification = await this.notificationsService.create({
        type: NotificationType.TASK_UPDATED,
        message: `A tarefa "${data.title}" foi atualizada`,
        userId,
        taskId: data.taskId,
      });

      // Emitir notificação via WebSocket
      this.notificationsGateway.sendNotificationToUser(userId, notification);
    }
  }

  @EventPattern('task.comment.created')
  async handleCommentCreated(@Payload() data: CommentCreatedEvent) {
    this.logger.log(
      `Received task.comment.created event: ${JSON.stringify(data)}`,
    );

    // Notificar todos os assignees (exceto o autor do comentário)
    const usersToNotify = (data.assigneeIds || []).filter(
      (id) => id !== data.authorId,
    );

    for (const userId of usersToNotify) {
      const notification = await this.notificationsService.create({
        type: NotificationType.COMMENT_CREATED,
        message: `Novo comentário na tarefa${data.taskTitle ? ` "${data.taskTitle}"` : ''}`,
        userId,
        taskId: data.taskId,
      });

      // Emitir notificação via WebSocket
      this.notificationsGateway.sendNotificationToUser(userId, notification);
    }
  }
}
