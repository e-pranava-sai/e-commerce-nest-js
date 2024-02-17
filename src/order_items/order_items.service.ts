import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './order_item.entity';
import { Repository } from 'typeorm';
import { CustomException } from 'src/exception_filters/custom.exception';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { Orders } from 'src/orders/order.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async getOrderItems(): Promise<{ orderItems: OrderItem[] }> {
    try {
      const orderItems = await this.orderItemRepository.find();
      return { orderItems };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOrderItemsByUserId(
    userId: number,
  ): Promise<{ orderItems: OrderItem[] }> {
    try {
      const existUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!existUser) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      const orderItems = await this.orderItemRepository.find({
        where: { user_id: userId },
      });
      return { orderItems };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createOrderItemByUserIdOrderId(
    userId: number,
    orderId: number,
    productId: number,
    quantity: number,
  ): Promise<{ orderItem: OrderItem }> {
    try {
      const existUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!existUser) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      const existOrder = await this.ordersRepository.findOne({
        where: { id: orderId },
      });
      if (!existOrder) {
        throw new CustomException('Order not found', HttpStatus.NOT_FOUND);
      }

      if (+existOrder.user_id !== +userId) {
        throw new CustomException('Order not found', HttpStatus.NOT_FOUND);
      }

      const existProduct = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!existProduct) {
        throw new CustomException('Product not found', HttpStatus.NOT_FOUND);
      }

      const orderItem = await this.orderItemRepository.save({
        user_id: userId,
        order_id: orderId,
        product_id: productId,
        product_price: existProduct.price,
        quantity,
      });
      await this.orderItemRepository.save(orderItem);
      return { orderItem };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteOrderItem(orderItemId: number): Promise<{ message: string }> {
    try {
      const existOrderItem = await this.orderItemRepository.findOne({
        where: { id: orderItemId },
      });
      if (!existOrderItem) {
        throw new CustomException('Order Item not found', HttpStatus.NOT_FOUND);
      }

      await this.orderItemRepository.delete({ id: orderItemId });
      return { message: 'Order Item deleted successfully' };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
