import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { CustomException } from 'src/exception_filters/custom.exception';
import { User } from 'src/users/user.entity';
import { REQUEST } from '@nestjs/core';
import { CreateProductDto } from './product.dto';

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
        where: { owner: { id: ownerId } },
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
    createProductDto: CreateProductDto,
  ): Promise<{ product: Product }> {
    try {
      const existProduct = await this.productRepository.findOne({
        where: {
          name: createProductDto.name,
          category: createProductDto.category,
        },
      });

      const user = await this.userRepository.findOne({
        where: { id: this.request.userId },
      });

      if (existProduct) {
        throw new CustomException(
          'Product already exists with this name and this category',
          HttpStatus.CONFLICT,
        );
      }

      const newProduct = new Product();
      newProduct.name = createProductDto.name;
      newProduct.price = createProductDto.price;
      newProduct.category = createProductDto.category;
      newProduct.owner = user;
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
        relations: { owner: true },
      });

      if (!existProduct) {
        throw new CustomException('Product not found', HttpStatus.NOT_FOUND);
      }

      if (existProduct.owner.id !== this.request.userId) {
        throw new CustomException(
          'You are not authorized to update this product',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const updated_product = await this.productRepository.update(
        { id },
        {
          name: name || existProduct.name,
          price: price || existProduct.price,
          category: category || existProduct.category,
        },
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
    productId: number,
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
        where: { id: productId },
        relations: { owner: true },
      });
      if (!existProduct) {
        throw new CustomException('Product not found', HttpStatus.NOT_FOUND);
      }

      if (+existProduct.owner.id !== +ownerId) {
        throw new CustomException(
          `Product not found for this user: ${ownerId}, product id: ${productId}.`,
          HttpStatus.UNAUTHORIZED,
        );
      }
      const updated_product = await this.productRepository.update(
        { id: productId },
        {
          name: name || existProduct.name,
          price: price || existProduct.price,
          category: category || existProduct.category,
        },
      );
      return { message: `Product with ID: ${productId} updated successfully` };
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
      const product = await this.productRepository.findOne({
        where: { id },
        relations: { owner: true },
      });
      if (!product) {
        throw new CustomException('Product not found', HttpStatus.NOT_FOUND);
      }
      if (product.owner.id !== this.request.userId) {
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
