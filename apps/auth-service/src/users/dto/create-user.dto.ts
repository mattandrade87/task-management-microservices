import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString({ message: 'Username deve ser uma string' })
  username: string;

  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  @IsString({ message: 'Senha deve ser uma string' })
  password: string;
}
