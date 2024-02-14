import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { CustomException } from 'src/exception_filters/custom.exception';
import { User } from 'src/users/user.entity';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(REQUEST) private readonly request: { userId: number },
  ) {}

  async getProducts(): Promise<{ products: Product[] }> {
    try {
      const products = await this.productRepository.find();
      return { products };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProductById(id: number): Promise<{ product: Product }> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        throw new CustomException('Product not found', HttpStatus.NOT_FOUND);
      }
      return { product };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProductByOwnerId(ownerId: number): Promise<{ products: Product[] }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: ownerId },
      });
      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }
      const products = await this.productRepository.find({
        where: { owner_id: ownerId },
      });
      return { products };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProductByCategory(
    category: string,
  ): Promise<{ products: Product[] }> {
    try {
      const products = await this.productRepository.find({
        where: { category },
      });
      return { products };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createProduct(
    name: string,
    price: number,
    category: string,
  ): Promise<{ product: Product }> {
    try {
      const existProduct = await this.productRepository.findOne({
        where: { name },
      });

      if (existProduct) {
        throw new CustomException(
          'Product already exists with this name',
          HttpStatus.CONFLICT,
        );
      }

      const newProduct = new Product();
      newProduct.name = name;
      newProduct.price = price;
      newProduct.category = category;
      newProduct.owner_id = this.request.userId;
      const product = await this.productRepository.save(newProduct);
      return { product };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProduct(
    id: number,
    name: string,
    price: number,
    category: string,
  ): Promise<{ message: string }> {
    try {
      const existProduct = await this.productRepository.findOne({
        where: { id },
      });

      if (!existProduct) {
        throw new CustomException('Product not found', HttpStatus.NOT_FOUND);
      }
      if (existProduct.owner_id !== this.request.userId) {
        throw new CustomException(
          'You are not authorized to update this product',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const updated_product = await this.productRepository.update(
        { id },
        { name, price, category },
      );
      return { message: `Product with ID: ${id} updated successfully` };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProductByOwnerId(
    ownerId: number,
    id: number,
    name: string,
    price: number,
    category: string,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: ownerId },
      });
      if (!user) {
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);
      }
      const existProduct = await this.productRepository.findOne({
        where: { id },
      });

      if (!existProduct) {
        throw new CustomException('Product not found', HttpStatus.NOT_FOUND);
      }
      if (existProduct.owner_id !== ownerId) {
        throw new CustomException(
          'Product not found for this user',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const updated_product = await this.productRepository.update(
        { id },
        { name, price, category },
      );
      return { message: `Product with ID: ${id} updated successfully` };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        throw new CustomException('Product not found', HttpStatus.NOT_FOUND);
      }
      if (product.owner_id !== this.request.userId) {
        throw new CustomException(
          'You are not authorized to delete this product',
          HttpStatus.UNAUTHORIZED,
        );
      }
      await this.productRepository.delete({ id });
      return { message: 'Product deleted successfully' };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
