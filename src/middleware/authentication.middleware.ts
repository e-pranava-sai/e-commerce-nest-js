import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { BlackListService } from 'src/black_list/black_list.service';
import { CustomException } from 'src/exception_filters/custom.exception';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private blacklistService: BlackListService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [access_token, refresh_token] = this.extractTokenFromHeader(request);

    try {
      if (!access_token || access_token === 'null') {
        throw new CustomException(
          'Provide a valid access token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!refresh_token || refresh_token === 'null') {
        throw new CustomException(
          'Provide a valid refresh token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (
        await this.blacklistService.isTokenBlacklisted(
          request.headers['authorization'],
        )
      ) {
        throw new CustomException(
          'Invalid token. Relogin',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload = this.jwtService.verify(access_token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      console.log(payload);

      const user = await this.userRepository.findOne({
        where: { id: parseInt(payload.userId) },
      });

      if (!user) {
        throw new CustomException('Invalid Refresh Token', HttpStatus.CONFLICT);
      }

      if (user.email !== payload.email) {
        throw new CustomException('Invalid Access Token', HttpStatus.CONFLICT);
      }

      request.userId = parseInt(payload.userId);
      request.email = payload.email;
      request.is_admin = Boolean(payload.is_admin);
      console.log(payload);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        const { userId, email, is_admin } =
          await this.createAccessTokenFromRefreshToken(refresh_token);

        console.log('From catch Token Expired Error', userId, email, is_admin);
        request.userId = userId;
        request.email = email;
        request.is_admin = is_admin;
        return true;
      }
      console.log(err);
      throw new CustomException(
        err.message || 'Internal Server Error or Token Expired',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  private async createAccessTokenFromRefreshToken(
    refresh_token: string,
  ): Promise<{ userId: number; email: string; is_admin: boolean }> {
    try {
      const payload = this.jwtService.verify(refresh_token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      console.log('createAccessTokenFromRefreshToken', payload);

      const user = await this.userRepository.findOne({
        where: { id: parseInt(payload.userId) },
      });

      if (!user) {
        throw new CustomException('Invalid Refresh Token', HttpStatus.CONFLICT);
      }

      if (user.email !== payload.email) {
        throw new CustomException('Invalid Refresh Token', HttpStatus.CONFLICT);
      }

      return {
        userId: parseInt(payload.userId),
        email: payload.email,
        is_admin: payload.is_admin,
      };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error or Token Expired',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private extractTokenFromHeader(
    request: Request,
  ): [string, string] | undefined {
    const [type, access_token, refresh_token] =
      request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' || access_token !== null || refresh_token !== null
      ? [access_token, refresh_token]
      : undefined;
  }
}
