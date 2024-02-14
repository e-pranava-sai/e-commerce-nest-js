import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './cart_item.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { Cart } from 'src/carts/cart.entity';
import { CustomException } from 'src/exception_filters/custom.exception';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async getCartItems(): Promise<{ cart_items: CartItem[] }> {
    try {
      const cart_items = await this.cartItemRepository.find();
      return { cart_items };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCartItemsByUserId(
    userId: number,
  ): Promise<{ cart_items: CartItem[] }> {
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

      const cart_items = await this.cartItemRepository.find({
        where: { cart_id: cart.id },
      });
      return { cart_items };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createCartItemByUserId(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<{ cart_item: CartItem }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }

      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new CustomException('Product not found', HttpStatus.NOT_FOUND);
      }

      const cart = await this.cartRepository.findOne({
        where: { user_id: userId },
      });
      if (!cart) {
        throw new CustomException('Cart not found', HttpStatus.NOT_FOUND);
      }

      const cart_item = await this.cartItemRepository.findOne({
        where: { cart_id: cart.id, product_id: productId },
      });
      if (cart_item) {
        cart_item.quantity += quantity;
        await this.cartItemRepository.save(cart_item);
        return { cart_item };
      }

      const newCartItem = new CartItem();
      newCartItem.user_id = userId;
      newCartItem.product_id = productId;
      newCartItem.cart_id = cart.id;
      newCartItem.quantity = quantity;
      await this.cartItemRepository.save(newCartItem);
      return { cart_item: newCartItem };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateCartItem(
    cartItemId: number,
    quantity: number,
  ): Promise<Record<string, any>> {
    try {
      const cart_item = await this.cartItemRepository.findOne({
        where: { id: cartItemId },
      });
      if (!cart_item) {
        throw new CustomException('Cart item not found', HttpStatus.NOT_FOUND);
      }

      cart_item.quantity = quantity;
      await this.cartItemRepository.save(cart_item);
      return { cart_item };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteCartItem(cartItemId: number): Promise<{ message: string }> {
    try {
      const cart_item = await this.cartItemRepository.findOne({
        where: { id: cartItemId },
      });
      if (!cart_item) {
        throw new CustomException('Cart item not found', HttpStatus.NOT_FOUND);
      }

      await this.cartItemRepository.delete(cartItemId);
      return { message: 'Cart item deleted successfully' };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
