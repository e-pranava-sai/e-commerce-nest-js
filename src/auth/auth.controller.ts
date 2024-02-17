import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Record<string, any> {
    return this.authService.login(email, password);
  }

  @Post('signup')
  signup(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('is_admin') is_admin: boolean,
  ): Record<string, any> {
    return this.authService.signup(name, email, password, is_admin);
  }
}
