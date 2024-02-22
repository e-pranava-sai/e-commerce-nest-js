import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/carts/cart.entity';
import { CustomException } from 'src/exception_filters/custom.exception';
import { CreateUserDto } from 'src/users/user.dto';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
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
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const exis_user = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (exis_user !== null) {
        throw new CustomException(
          'User already exists with this email',
          HttpStatus.CONFLICT,
        );
      }

      const new_user = new User();
      new_user.name = createUserDto.name;
      new_user.email = createUserDto.email;
      new_user.password = createUserDto.password;
      new_user.is_admin = createUserDto.is_admin;

      const user = await this.userRepository.save(new_user);

      const cart = await this.cartRepository.save({ user_id: user.id });

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
