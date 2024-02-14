import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './order_item.entity';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { Cart } from 'src/carts/cart.entity';
import { OrderItemsController } from './order_items.controller';
import { OrderItemsService } from './order_items.service';
import { Orders } from 'src/orders/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, User, Product, Cart, Orders])],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
})
export class OrderItemsModule {}
