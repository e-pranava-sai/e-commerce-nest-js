import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Orders, User])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
