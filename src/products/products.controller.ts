import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from 'src/middleware/authentication.middleware';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Product } from './product.entity';
import { REQUEST } from '@nestjs/core';
import { AuthorizeGuard } from 'src/middleware/authorization.middleware';

@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @CacheKey('products')
  @CacheTTL(30)
  @Get()
  getProducts(): Record<string, any> {
    return this.productsService.getProducts();
  }

  @Get(':id')
  getProductById(@Param('id') productId: number): Record<string, any> {
    return this.productsService.getProductById(productId);
  }

  @Get('category/:category')
  getProductByCategory(
    @Param('category') category: string,
  ): Record<string, any> {
    return this.productsService.getProductByCategory(category);
  }

  @Get('owner/:id')
  getProductByOwnerId(@Param('id') ownerId: number): Record<string, any> {
    return this.productsService.getProductByOwnerId(ownerId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Post()
  addProduct(
    @Body('name') name: string,
    @Body('price') price: number,
    @Body('category') catergory: string,
  ): Record<string, any> {
    return this.productsService.createProduct(name, price, catergory);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  updateProduct(
    @Param('id') productId: number,
    @Body('name') name: string,
    @Body('price') price: number,
    @Body('category') catergory: string,
  ): Record<string, any> {
    return this.productsService.updateProduct(
      productId,
      name,
      price,
      catergory,
    );
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Put(':ownerId/:productId')
  updateProductByOwnerId(
    @Param('ownerId') ownerId: number,
    @Param('productId') productId: number,
    @Body('name') name: string,
    @Body('price') price: number,
    @Body('category') catergory: string,
  ): Record<string, any> {
    return this.productsService.updateProductByOwnerId(
      ownerId,
      productId,
      name,
      price,
      catergory,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteProduct(@Param('id') productId: number): Record<string, any> {
    return this.productsService.deleteProduct(productId);
  }
}
