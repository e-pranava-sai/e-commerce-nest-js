import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/exception_filters/custom.exception';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
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

      const payload = {
        userId: user.id,
        is_admin: user.is_admin,
        email: user.email,
      };
      return {
        access_token: await this.jwtService.signAsync(payload, {
          secret: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '60s',
        }),

        refresh_token: await this.jwtService.signAsync(payload, {
          secret: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '1d',
        }),
      };
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
  ): Promise<{ access_token: string; refresh_token: string }> {
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

      const payload = {
        userId: user.id,
        is_admin: user.is_admin,
        email: user.email,
      };

      return {
        access_token: await this.jwtService.signAsync(payload, {
          secret: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '60s',
        }),
        refresh_token: await this.jwtService.signAsync(payload, {
          secret: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '1d',
        }),
      };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
