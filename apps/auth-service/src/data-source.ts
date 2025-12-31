import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { RefreshToken } from './auth/refresh-token.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'challenge_db',
  entities: [User, RefreshToken],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
