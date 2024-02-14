import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CustomException } from 'src/exception_filters/custom.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new CustomException(
        'Provide a valid token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      request.userId = parseInt(payload.userId);
      request.email = payload.email;
      request.is_admin = payload.is_admin;
      console.log(payload);
    } catch (err) {
      console.log(err);
      throw new CustomException(
        err.message || 'Internal Server Error or Token Expired',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
