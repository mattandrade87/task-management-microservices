import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

  @MessagePattern('create_task')
  async create(
    @Payload() data: { dto: CreateTaskDto; userId: string },
  ) {
    const task = await this.tasksService.create(data.dto, data.userId);
    
    // Publish event
    this.rabbitClient.emit('task.created', {
      taskId: task.id,
      title: task.title,
      createdById: task.createdById,
      assigneeIds: task.assigneeIds || [],
    });

    return task;
  }

  @MessagePattern('find_all_tasks')
  async findAll(@Payload() data: { page?: number; size?: number }) {
    return await this.tasksService.findAll(data.page, data.size);
  }

  @MessagePattern('find_task')
  async findOne(@Payload() id: string) {
    return await this.tasksService.findOne(id);
  }

  @MessagePattern('update_task')
  async update(
    @Payload() data: { id: string; dto: UpdateTaskDto; userId: string },
  ) {
    const task = await this.tasksService.update(data.id, data.dto, data.userId);

    // Publish event
    this.rabbitClient.emit('task.updated', {
      taskId: task.id,
      title: task.title,
      updatedById: data.userId,
      assigneeIds: task.assigneeIds || [],
      changes: data.dto,
    });

    return task;
  }

  @MessagePattern('delete_task')
  async remove(@Payload() data: { id: string; userId: string }) {
    await this.tasksService.remove(data.id, data.userId);
    return { success: true };
  }
}
