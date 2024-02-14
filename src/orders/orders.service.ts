import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from './order.entity';
import { Repository } from 'typeorm';
import { CustomException } from 'src/exception_filters/custom.exception';
import { User } from 'src/users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders) private ordersRepository: Repository<Orders>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getOrders(): Promise<{ orders: Orders[] }> {
    try {
      const orders = await this.ordersRepository.find();
      return { orders };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOrderByUserId(userId: number): Promise<{ order: Orders[] }> {
    try {
      const existUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!existUser) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      const order = await this.ordersRepository.find({
        where: { user_id: userId },
      });
      if (!order) {
        throw new CustomException('Order not found', HttpStatus.NOT_FOUND);
      }
      return { order };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createOrderByUserId(
    address: string,
    phone: string,
    userId: number,
  ): Promise<{ order: Orders }> {
    try {
      const existUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!existUser) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      const order = await this.ordersRepository.save({
        address,
        phone,
        user_id: userId,
        date: new Date(),
      });
      await this.ordersRepository.save(order);
      return { order };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteOrderByOrderId(orderId: number): Promise<{ message: string }> {
    try {
      const existOrder = await this.ordersRepository.findOne({
        where: { id: orderId },
      });
      if (!existOrder) {
        throw new CustomException('Order not found', HttpStatus.NOT_FOUND);
      }

      await this.ordersRepository.delete({ id: orderId });
      return { message: 'Order deleted successfully' };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
