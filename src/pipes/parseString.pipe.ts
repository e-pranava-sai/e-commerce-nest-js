import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CustomException } from 'src/exception_filters/custom.exception';

@Injectable()
export class ParseStringPipe implements PipeTransform<String, String> {
  transform(value: String, metadata: ArgumentMetadata): String {
    if (value.length === 0 || !value) {
      throw new CustomException(
        "Category Param shouldn't be empty.",
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    return value;
  }
}
