import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/v1/auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Record<string, any> {
    return this.usersService.login(email, password);
  }

  @Post('signup')
  signup(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('is_admin') is_admin: boolean,
  ): Record<string, any> {
    return this.usersService.signup(name, email, password, is_admin);
  }
}
