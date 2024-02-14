import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'int' })
  cart_id: number;

  @Column({ type: 'int' })
  quantity: number;
}
