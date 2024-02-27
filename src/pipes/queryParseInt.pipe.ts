import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CustomException } from 'src/exception_filters/custom.exception';

function isNumeric(value: string) {
  return /^-?\d+$/.test(value);
}

@Injectable()
export class QueryParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    try {
      if (!value) {
        return parseInt(value);
      }
      if (isNaN(parseInt(value)) || !isNumeric(value)) {
        throw new CustomException(
          'Query Params should be integer.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      if (parseInt(value) === 0) {
        throw new CustomException(
          'Query Params should be greater than 0',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      return parseInt(value);
    } catch (err) {
      throw new CustomException(err.message, err.status);
    }
  }
}
