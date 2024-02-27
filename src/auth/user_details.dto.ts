import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserDetailsDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Password must have atleast 5 characters' })
  password: string;

  static fields = ['email', 'password'];
}
