import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { Repository } from 'typeorm';
import { CustomException } from 'src/exception_filters/custom.exception';
import { User } from 'src/users/user.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getCarts(): Promise<{ carts: Cart[] }> {
    try {
      const carts = await this.cartRepository.find();
      return { carts };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCartByUserId(userId: number): Promise<{ cart: Cart }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      const cart = await this.cartRepository.findOne({
        where: { user_id: userId },
      });
      if (!cart) {
        throw new CustomException('Cart not found', HttpStatus.NOT_FOUND);
      }
      return { cart };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createCartByUserId(userId: number): Promise<{ cart: Cart }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      console.log('cart', user);
      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      const existCart = await this.cartRepository.findOne({
        where: { user_id: userId },
      });
      if (existCart) {
        throw new CustomException('Cart already exist', HttpStatus.BAD_REQUEST);
      }

      console.log('cart', existCart, 'userID: ', userId);

      const cart = await this.cartRepository.save({ user_id: userId });
      return { cart };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteCartByUserId(userId: number): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }
      const cart = await this.cartRepository.findOne({
        where: { user_id: userId },
      });
      if (!cart) {
        throw new CustomException('Cart not found', HttpStatus.NOT_FOUND);
      }
      await this.cartRepository.delete(cart.id);
      return { message: 'Cart deleted successfully' };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
