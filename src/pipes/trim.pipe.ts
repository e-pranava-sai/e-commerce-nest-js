import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  private isObj(obj: any): boolean {
    return typeof obj === 'object' && obj !== null;
  }

  private trim(values: any) {
    Object.keys(values).forEach((key) => {
      if (typeof values[key] === 'string') {
        values[key] = values[key].trim();
      }
    });

    return values;
  }

  transform(values: any, metadata: ArgumentMetadata) {
    if (!values) {
      return values;
    }
    console.log('trim pipe', values, typeof values, metadata);
    if (this.isObj(values)) return this.trim(values);
    if (typeof values === 'string') return values.trim();
    return values;
  }
}
