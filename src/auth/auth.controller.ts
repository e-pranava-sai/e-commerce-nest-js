import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/user.dto';
import { ExtraFieldsInterceptor } from 'src/interceptors/extrafields.interceptor';

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
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, CreateUserDto.fields))
  signup(@Body() createUserDto: CreateUserDto): Record<string, any> {
    return this.authService.signup(createUserDto);
  }
}
