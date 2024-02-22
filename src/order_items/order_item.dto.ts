import { IsNumber } from 'class-validator';

export class CreateOrderItemDto {
  @IsNumber()
  product_id: number;

  @IsNumber()
  quantity: number;

  static fields = ['product_id', 'quantity'];
}
