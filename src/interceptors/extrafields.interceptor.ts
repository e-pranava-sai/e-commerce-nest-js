import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { CustomException } from 'src/exception_filters/custom.exception';

export class ExtraFieldsInterceptor implements NestInterceptor {
  constructor(private readonly allowedFields: string[]) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const requestBodyFields = Object.keys(request.body);
    console.log('allowed fields', this.allowedFields);
    console.log('request body fields', requestBodyFields);
    const extraFields = requestBodyFields.filter(
      (field) => !this.allowedFields.includes(field),
    );

    console.log(extraFields);

    if (extraFields.length > 0) {
      throw new CustomException(
        `Extra fields found: '${extraFields.join(', ')}'`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }
}
