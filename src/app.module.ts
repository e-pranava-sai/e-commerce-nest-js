import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CartsModule } from './carts/carts.module';
import { CartItemsModule } from './cart_items/cart_items.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order_items/order_items.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './categories/category.module';
import { BlacklistModuel } from './black_list/black_list.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      synchronize: true,
      // dropSchema: true,
      logging: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    CacheModule.register({ isGlobal: true }),
    ProductsModule,
    UsersModule,
    CartsModule,
    CartItemsModule,
    OrdersModule,
    OrderItemsModule,
    AuthModule,
    CategoryModule,
    BlacklistModuel,
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
