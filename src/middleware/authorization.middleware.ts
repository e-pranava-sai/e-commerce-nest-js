import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomException } from 'src/exception_filters/custom.exception';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.is_admin) {
      throw new CustomException(
        'You are not authorized to perform this action',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}
