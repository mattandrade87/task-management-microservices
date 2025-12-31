import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Formato de e-mail inválido" })
  email: string;

  @IsString()
  @MinLength(3, { message: "O username deve ter no mínimo 3 caracteres" })
  username: string;

  @IsString()
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres" })
  password: string;
}
