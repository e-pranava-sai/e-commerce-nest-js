import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { Repository } from 'typeorm';
import { CustomException } from 'src/exception_filters/custom.exception';
import { CategoryDto } from './category.dto';
import { Product } from 'src/products/product.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getCategories(categoryId: number): Promise<{ categories: Category[] }> {
    try {
      console.log(categoryId);
      if (categoryId) {
        const categoryById = await this.categoryRepository.findOne({
          where: { id: categoryId },
        });
        if (!categoryById) {
          throw new CustomException(
            'Category not found!',
            HttpStatus.NOT_FOUND,
          );
        }

        return { categories: [categoryById] };
      }
      const categories = await this.categoryRepository.find();
      return { categories };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProductsByCategory(
    categoryId: number,
  ): Promise<{ products: Product[] }> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
        relations: { products: true },
      });

      if (!category) {
        throw new CustomException('Category Not found.', HttpStatus.NOT_FOUND);
      }

      return { products: category.products };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createCategory(
    categoryDto: CategoryDto,
  ): Promise<{ category: Category }> {
    try {
      let category = await this.categoryRepository.findOne({
        where: { name: categoryDto.name },
      });
      if (category) {
        throw new CustomException(
          'Category already exists!',
          HttpStatus.CONFLICT,
        );
      }

      category = await this.categoryRepository.save({
        name: categoryDto.name,
      });
      return { category };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateCategory(
    categoryId: number,
    categoryDto: CategoryDto,
  ): Promise<{ category: Category }> {
    try {
      const categoryById = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!categoryById) {
        throw new CustomException('Category not found!', HttpStatus.NOT_FOUND);
      }

      if (categoryById.name === categoryDto.name) {
        throw new CustomException(
          'Category name should be different from old name.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      const categoryByName = await this.categoryRepository.findOne({
        where: { name: categoryDto.name },
      });
      if (categoryByName) {
        throw new CustomException(
          'Category already exist!',
          HttpStatus.CONFLICT,
        );
      }

      categoryById.name = categoryDto.name;
      const updatedCategory = await this.categoryRepository.save(categoryById);

      return { category: updatedCategory };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteCategory(categoryId: number): Promise<{ message: string }> {
    try {
      let category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new CustomException('Category not found!', HttpStatus.NOT_FOUND);
      }

      await this.categoryRepository.delete({ id: categoryId });

      return { message: 'Category deleted successfully' };
    } catch (e) {
      console.log(e);
      throw new CustomException(
        e.message || 'Internal Server Error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
