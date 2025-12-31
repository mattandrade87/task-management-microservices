import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskHistory, TaskAction } from './entities/task-history.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskHistory)
    private readonly historyRepository: Repository<TaskHistory>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdById: userId,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
    });

    const savedTask = await this.taskRepository.save(task);

    // Create history record
    await this.createHistory(savedTask.id, userId, TaskAction.CREATED, {
      task: savedTask,
    });

    return savedTask;
  }

  async findAll(
    page: number = 1,
    size: number = 10,
  ): Promise<{ data: Task[]; total: number; page: number; size: number }> {
    const [data, total] = await this.taskRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      size,
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['comments'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.findOne(id);

    // Store changes for history
    const changes: Record<string, any> = {};
    Object.keys(updateTaskDto).forEach((key) => {
      if (task[key] !== updateTaskDto[key]) {
        changes[key] = {
          old: task[key],
          new: updateTaskDto[key],
        };
      }
    });

    // Update task
    Object.assign(task, {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : task.dueDate,
    });

    const updatedTask = await this.taskRepository.save(task);

    // Create history record if there are changes
    if (Object.keys(changes).length > 0) {
      await this.createHistory(task.id, userId, TaskAction.UPDATED, changes);
    }

    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id);

    // Create history record before deletion
    await this.createHistory(task.id, userId, TaskAction.DELETED, {
      task,
    });

    await this.taskRepository.remove(task);
  }

  private async createHistory(
    taskId: string,
    changedById: string,
    action: TaskAction,
    changes: Record<string, any>,
  ): Promise<void> {
    const history = this.historyRepository.create({
      taskId,
      changedById,
      action,
      changes,
    });

    await this.historyRepository.save(history);
  }
}
