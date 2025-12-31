import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy } from '@nestjs/microservices';
import { CommentsService } from './comments.service';
import { TasksService } from '../tasks/tasks.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly tasksService: TasksService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

  @MessagePattern('create_comment')
  async create(
    @Payload()
    data: { taskId: string; dto: CreateCommentDto; authorId: string },
  ) {
    const comment = await this.commentsService.create(
      data.taskId,
      data.dto,
      data.authorId,
    );

    // Get task details for notification
    const task = await this.tasksService.findOne(data.taskId);

    // Publish event
    this.rabbitClient.emit('task.comment.created', {
      taskId: data.taskId,
      commentId: comment.id,
      text: comment.text,
      authorId: data.authorId,
      taskTitle: task.title,
      assigneeIds: task.assigneeIds || [],
    });

    return comment;
  }

  @MessagePattern('find_task_comments')
  async findByTask(
    @Payload() data: { taskId: string; page?: number; size?: number },
  ) {
    return await this.commentsService.findByTask(
      data.taskId,
      data.page,
      data.size,
    );
  }
}
