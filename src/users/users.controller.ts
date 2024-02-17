import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthorizeGuard } from 'src/middleware/authorization.middleware';
import { AuthGuard } from 'src/middleware/authentication.middleware';

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
  createUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('is_admin') is_admin: boolean,
  ): Record<string, any> {
    return this.usersService.createUser(name, email, password, is_admin);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get(':id')
  getUserById(@Param('id') userId: number): Record<string, any> {
    return this.usersService.getUserById(userId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Delete(':id')
  deleteUser(@Param('id') userId: number): Record<string, any> {
    return this.usersService.deleteUser(userId);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  updateUser(
    @Param('id') userId: number,
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ): Record<string, any> {
    return this.usersService.updateUser(userId, name, email, password);
  }
}
