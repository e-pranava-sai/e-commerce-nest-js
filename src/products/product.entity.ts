import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'decimal',
    default: 0,
    nullable: false,
  })
  price: number;

  @Column({ type: 'int' })
  owner_id: number;

  @Column({ type: 'varchar', length: 255 })
  category: string;
}
