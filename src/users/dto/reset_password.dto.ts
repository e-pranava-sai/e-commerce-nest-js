import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Password must have atleast 5 characters' })
  old_password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Password must have atleast 5 characters' })
  new_password: string;

  static fields = ['old_password', 'new_password'];
}
