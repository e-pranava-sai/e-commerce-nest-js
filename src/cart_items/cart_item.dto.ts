import { IsNumber } from 'class-validator';

export class CreateCartItemDto {
  @IsNumber()
  quantity: number;

  @IsNumber()
  productId: number;

  static fields = ['quantity', 'productId'];
}
