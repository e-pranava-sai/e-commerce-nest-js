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
    private jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      if (user.password !== password) {
        throw new CustomException(
          'Password incorrect',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload = { userId: user.id, isAdmin: user.is_admin };
      return { access_token: await this.jwtService.signAsync(payload) };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signup(
    name: string,
    email: string,
    password: string,
    is_admin: boolean,
  ): Promise<{ access_token: string }> {
    try {
      const exis_user = await this.userRepository.findOne({
        where: { email },
      });

      if (exis_user !== null) {
        throw new CustomException(
          'User already exists with this email',
          HttpStatus.CONFLICT,
        );
      }

      const new_user = new User();
      new_user.name = name;
      new_user.email = email;
      new_user.password = password;
      new_user.is_admin = is_admin;

      const user = await this.userRepository.save(new_user);

      const payload = { userId: user.id, isAdmin: user.is_admin };

      return { access_token: await this.jwtService.signAsync(payload) };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
