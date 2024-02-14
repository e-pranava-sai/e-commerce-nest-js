import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;
}
