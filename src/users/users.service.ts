import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Not, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from 'src/exception_filters/custom.exception';
import { Cart } from 'src/carts/cart.entity';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        relations: {
          products: true,
          orders: { order_items: true },
        },
      });
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserById(userId: number): Promise<User> {
    try {
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
      return user;
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (user) {
        throw new CustomException('User already exists', HttpStatus.CONFLICT);
      }

      const newUser = await this.userRepository.save({
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        is_admin: createUserDto.is_admin,
      });

      const cart = await this.cartRepository.save({ user_id: newUser.id });

      return await this.userRepository.save({ ...newUser, cartId: cart.id });
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

  async updateUser(userId: number, name: string, email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      const emailUser = await this.userRepository.findOne({
        where: { email: email },
      });
      if (emailUser) {
        throw new CustomException(
          'User already exist with this email.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      user.name = name || user.name;
      user.email = email || user.email;

      return await this.userRepository.save(user);
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
