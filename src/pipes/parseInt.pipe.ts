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
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    try {
      if (isNaN(parseInt(value)) || !isNumeric(value)) {
        throw new CustomException(
          'Params should be integer.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      return parseInt(value);
    } catch (err) {
      throw new CustomException(err.message, err.status);
    }
  }
}
