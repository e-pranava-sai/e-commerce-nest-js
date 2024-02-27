import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'Name must have atleast 2 characters.' })
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  categoryId: number;

  static fields = ['name', 'price', 'categoryId'];
}
