import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CustomException } from 'src/exception_filters/custom.exception';
import { Cart } from 'src/carts/cart.entity';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from './dto/reset_password.dto';
import { BlackListService } from 'src/black_list/black_list.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @Inject(REQUEST) private readonly request: any,
    private blacklistService: BlackListService,
  ) {}

  async getAllUsers(userId: number): Promise<{ users: User[] }> {
    try {
      if (userId) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: {
            products: true,
            orders: { order_items: true },
          },
        });
        if (!user) {
          throw new CustomException(
            `User not found with id ${userId}.`,
            HttpStatus.NOT_FOUND,
          );
        }
        return { users: [user] };
      }
      const users = await this.userRepository.find({
        relations: {
          products: true,
          orders: { order_items: true },
        },
      });
      return { users };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async getUserById(userId: number): Promise<User> {
  //   try {
  //     const user = await this.userRepository.findOne({
  //       where: { id: userId },
  //       relations: {
  //         products: true,
  //         orders: { order_items: true },
  //       },
  //     });
  //     if (!user) {
  //       throw new CustomException(
  //         `User not found with id ${userId}.`,
  //         HttpStatus.NOT_FOUND,
  //       );
  //     }
  //     return user;
  //   } catch (e) {
  //     console.log(e);
  //     throw new CustomException(
  //       e.message || 'Internal Server Error',
  //       e.status || HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  async createUser(createUserDto: CreateUserDto): Promise<{ user: User }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (user) {
        throw new CustomException('User already exists', HttpStatus.CONFLICT);
      }

      const password_hash = await bcrypt.hash(createUserDto.password, 10);

      const newUser = await this.userRepository.save({
        name: createUserDto.name,
        email: createUserDto.email,
        password: password_hash,
        is_admin: createUserDto.is_admin,
      });

      const cart = await this.cartRepository.save({ user_id: newUser.id });

      const updatedUser = await this.userRepository.save({
        ...newUser,
        cartId: cart.id,
      });

      return { user: updatedUser };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      await this.userRepository.delete({ id: userId });

      return { message: 'User deleted successfully' };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(
    userId: number,
    name: string,
    email: string,
  ): Promise<{ message: string }> {
    try {
      if (!name && !email) {
        throw new CustomException(
          'Please provide fields needs to be updated.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      if (email) {
        const emailUser = await this.userRepository.findOne({
          where: { email: email },
        });

        if (emailUser) {
          throw new CustomException(
            'User already exist with this email.',
            HttpStatus.NOT_ACCEPTABLE,
          );
        }

        user.email = email || user.email;
      }

      if (name) {
        user.name = name;
      }

      const updatedUser = await this.userRepository.save(user);

      return { message: 'User updated successfully. Relogin.' };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePassword(
    userId: number,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      if (resetPasswordDto.new_password === resetPasswordDto.old_password) {
        throw new CustomException(
          'New password should be different from old password.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      const isMatch = await bcrypt.compare(
        resetPasswordDto.old_password,
        user.password,
      );

      if (!isMatch) {
        throw new CustomException(
          'Old Password incorrect',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const password_hash = await bcrypt.hash(
        resetPasswordDto.new_password,
        10,
      );

      user.password = password_hash;

      await this.blacklistService.addToBlacklist(
        this.request.headers['authorization'],
      );

      await this.userRepository.save(user);

      return { message: 'Password updated successfully. Relogin.' };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
