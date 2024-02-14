import { Module } from '@nestjs/common';
import { CartItemsController } from './cart_items.controller';
import { Cart } from 'src/carts/cart.entity';
import { CartItemsService } from './cart_items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { CartItem } from './cart_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, User, Product, CartItem])],
  controllers: [CartItemsController],
  providers: [CartItemsService],
})
export class CartItemsModule {}
