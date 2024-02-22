import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @MinLength(10, { message: 'Phone number must have atleast 10 characters.' })
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MinLength(2, { message: 'Address must have atleast 2 characters.' })
  @IsNotEmpty()
  address: string;

  static fields = ['phone', 'address'];
}
