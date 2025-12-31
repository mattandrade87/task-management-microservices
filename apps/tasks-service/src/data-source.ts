import { DataSource } from 'typeorm';
import { Task } from './tasks/entities/task.entity';
import { TaskHistory } from './tasks/entities/task-history.entity';
import { Comment } from './comments/entities/comment.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'challenge_db',
  entities: [Task, TaskHistory, Comment],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
