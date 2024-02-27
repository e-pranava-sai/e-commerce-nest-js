import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { CustomException } from 'src/exception_filters/custom.exception';
import { User } from 'src/users/user.entity';
import { REQUEST } from '@nestjs/core';
import { CreateProductDto } from './product.dto';
import { Category } from 'src/categories/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @Inject(REQUEST) private readonly request: { userId: number },
  ) {}

  async getProducts(productId: number): Promise<{ products: Product[] }> {
    try {
      if (productId) {
        const product = await this.productRepository.findOne({
          where: { id: productId },
        });
        if (!product) {
          throw new CustomException('Product not found', HttpStatus.NOT_FOUND);
        }
        return { products: [product] };
      }
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

  // async getProductById(id: number): Promise<{ product: Product }> {
  //   try {
  //   } catch (e) {
  //     console.log(e);
  //     throw new CustomException(
  //       e.message || 'Internal Server Error',
  //       e.status || HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

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

  // async getProductByCategory(
  //   category: number,
  // ): Promise<{ products: Product[] }> {
  //   try {
  //     const products = await this.productRepository.find({
  //       where: { category },
  //     });
  //     return { products };
  //   } catch (e) {
  //     console.log(e);
  //     throw new CustomException(
  //       e.message || 'Internal Server Error',
  //       e.status || HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  async createProduct(
    createProductDto: CreateProductDto,
  ): Promise<{ product: Product }> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: createProductDto.categoryId },
      });

      if (!category) {
        throw new CustomException('Category not found!', HttpStatus.NOT_FOUND);
      }

      const existProduct = await this.productRepository.findOne({
        where: {
          name: createProductDto.name,
          category: category,
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
      newProduct.category = category;
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
    categoryId: number,
  ): Promise<{ product: Product }> {
    try {
      if (!name && !price && !categoryId) {
        throw new CustomException(
          'Please provide fields that needs to be updated.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

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

      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new CustomException('Category not found', HttpStatus.NOT_FOUND);
      }

      existProduct.name = name || existProduct.name;
      existProduct.price = price || existProduct.price;
      existProduct.category = category || existProduct.category;

      const updated_product = await this.productRepository.save(existProduct);

      return { product: updated_product };
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
    categoryId: number,
  ): Promise<{ product: Product }> {
    try {
      if (!name && !price && !categoryId) {
        throw new CustomException(
          'Please provide fields that needs to be updated.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

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

      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new CustomException('Category not found', HttpStatus.NOT_FOUND);
      }

      existProduct.name = name || existProduct.name;
      existProduct.price = price || existProduct.price;
      existProduct.category = category || existProduct.category;

      const updated_product = await this.productRepository.save(existProduct);

      return { product: updated_product };
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
