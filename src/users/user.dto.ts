import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Name must have atleast 2 characters.' })
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Password must have atleast 5 characters' })
  password: string;

  @IsNotEmpty()
  @IsBoolean()
  is_admin: boolean;

  static fields = ['name', 'email', 'password', 'is_admin'];
}
