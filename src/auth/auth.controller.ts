import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { ExtraFieldsInterceptor } from 'src/interceptors/extrafields.interceptor';
import { UserDetailsDto } from './user_details.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, UserDetailsDto.fields))
  login(@Body() userDetailsDto: UserDetailsDto): Record<string, any> {
    return this.authService.login(userDetailsDto);
  }

  @Post('signup')
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, CreateUserDto.fields))
  signup(@Body() createUserDto: CreateUserDto): Record<string, any> {
    return this.authService.signup(createUserDto);
  }
}
