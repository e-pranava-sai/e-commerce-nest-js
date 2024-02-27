import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthorizeGuard } from 'src/middleware/authorization.middleware';
import { AuthGuard } from 'src/middleware/authentication.middleware';
import { CreateUserDto } from './dto/user.dto';
import { ExtraFieldsInterceptor } from 'src/interceptors/extrafields.interceptor';
import { ParamParseIntPipe } from 'src/pipes/paramParseInt.pipe';
import { ResetPasswordDto } from './dto/reset_password.dto';
import { QueryParseIntPipe } from 'src/pipes/queryParseInt.pipe';

@Controller('api/v1/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject('REQUEST') private request: { userId: number },
  ) {}

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get()
  getAllUsers(
    @Query('userId', QueryParseIntPipe) userId: number,
  ): Record<string, any> {
    return this.usersService.getAllUsers(userId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Post()
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, CreateUserDto.fields))
  createUser(@Body() createUserDto: CreateUserDto): Record<string, any> {
    return this.usersService.createUser(createUserDto);
  }

  // @UseGuards(AuthGuard, AuthorizeGuard)
  // @Get(':id')
  // getUserById(
  //   @Param('id', ParseIntPipe)
  //   userId: number,
  // ): Record<string, any> {
  //   return this.usersService.getUserById(userId);
  // }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Delete(':id')
  deleteUser(
    @Param('id', ParamParseIntPipe)
    userId: number,
  ): Record<string, any> {
    return this.usersService.deleteUser(userId);
  }

  @UseGuards(AuthGuard)
  @Put()
  updateUser(
    @Body('name') name: string,
    @Body('email') email: string,
  ): Record<string, any> {
    return this.usersService.updateUser(this.request.userId, name, email);
  }

  @UseGuards(AuthGuard)
  @Put('/reset-password')
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, ResetPasswordDto.fields))
  updatePassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.updatePassword(
      this.request.userId,
      resetPasswordDto,
    );
  }
}
