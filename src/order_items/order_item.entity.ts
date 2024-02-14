import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  order_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'decimal' })
  product_price: number;
}
