import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(
    taskId: string,
    createCommentDto: CreateCommentDto,
    authorId: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      taskId,
      authorId,
    });

    return await this.commentRepository.save(comment);
  }

  async findByTask(
    taskId: string,
    page: number = 1,
    size: number = 10,
  ): Promise<{ data: Comment[]; total: number; page: number; size: number }> {
    const [data, total] = await this.commentRepository.findAndCount({
      where: { taskId },
      skip: (page - 1) * size,
      take: size,
      order: { createdAt: 'ASC' },
    });

    return {
      data,
      total,
      page,
      size,
    };
  }
}
