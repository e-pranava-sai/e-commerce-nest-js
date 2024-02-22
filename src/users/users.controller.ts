import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthorizeGuard } from 'src/middleware/authorization.middleware';
import { AuthGuard } from 'src/middleware/authentication.middleware';
import { CreateUserDto } from './user.dto';
import { ExtraFieldsInterceptor } from 'src/interceptors/extrafields.interceptor';
import { ParseIntPipe } from 'src/pipes/parseInt.pipe';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get()
  getAllUsers(): Record<string, any> {
    return this.usersService.getAllUsers();
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Post()
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, CreateUserDto.fields))
  createUser(@Body() createUserDto: CreateUserDto): Record<string, any> {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get(':id')
  getUserById(
    @Param('id', ParseIntPipe)
    userId: number,
  ): Record<string, any> {
    return this.usersService.getUserById(userId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Delete(':id')
  deleteUser(
    @Param('id', ParseIntPipe)
    userId: number,
  ): Record<string, any> {
    return this.usersService.deleteUser(userId);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  updateUser(
    @Param('id', ParseIntPipe)
    userId: number,
    @Body('name') name: string,
    @Body('email') email: string,
  ): Record<string, any> {
    return this.usersService.updateUser(userId, name, email);
  }
}
