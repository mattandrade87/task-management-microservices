import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    @Inject('TASKS_SERVICE') private readonly tasksClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return await firstValueFrom(
      this.tasksClient.send('create_task', {
        dto: createTaskDto,
        userId: req.user.userId,
      }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('size') size: string = '10',
  ) {
    return await firstValueFrom(
      this.tasksClient.send('find_all_tasks', {
        page: parseInt(page, 10),
        size: parseInt(size, 10),
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.tasksClient.send('find_task', id),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    return await firstValueFrom(
      this.tasksClient.send('update_task', {
        id,
        dto: updateTaskDto,
        userId: req.user.userId,
      }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req) {
    return await firstValueFrom(
      this.tasksClient.send('delete_task', {
        id,
        userId: req.user.userId,
      }),
    );
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a task' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createComment(
    @Param('id') taskId: string,
    @Body() body: { text: string },
    @Request() req,
  ) {
    return await firstValueFrom(
      this.tasksClient.send('create_comment', {
        taskId,
        dto: body,
        authorId: req.user.userId,
      }),
    );
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for a task with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getComments(
    @Param('id') taskId: string,
    @Query('page') page: string = '1',
    @Query('size') size: string = '10',
  ) {
    return await firstValueFrom(
      this.tasksClient.send('find_task_comments', {
        taskId,
        page: parseInt(page, 10),
        size: parseInt(size, 10),
      }),
    );
  }
}
