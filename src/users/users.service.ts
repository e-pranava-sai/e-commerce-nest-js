import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Not, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from 'src/exception_filters/custom.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find();
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
      return await this.userRepository.findOne({ where: { id: userId } });
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    is_admin: boolean,
  ): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (user) {
        throw new CustomException('User already exists', HttpStatus.CONFLICT);
      }

      const newUser = await this.userRepository.save({
        name,
        email,
        password,
        is_admin,
      });

      return await this.userRepository.save(newUser);
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
    password: string,
  ): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      user.name = name || user.name;
      user.email = email || user.email;
      user.password = password || user.password;

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
