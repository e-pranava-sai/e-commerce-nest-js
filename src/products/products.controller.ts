import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from 'src/middleware/authentication.middleware';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { AuthorizeGuard } from 'src/middleware/authorization.middleware';
import { CreateProductDto } from './product.dto';
import { ExtraFieldsInterceptor } from 'src/interceptors/extrafields.interceptor';
import { ParseIntPipe } from 'src/pipes/parseInt.pipe';
import { ParseStringPipe } from 'src/pipes/parseString.pipe';

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
  getProductById(
    @Param('id', ParseIntPipe) productId: number,
  ): Record<string, any> {
    return this.productsService.getProductById(productId);
  }

  @Get('category/:category')
  getProductByCategory(
    @Param('category', ParseStringPipe) category: string,
  ): Record<string, any> {
    return this.productsService.getProductByCategory(category);
  }

  @Get('owner/:id')
  getProductByOwnerId(
    @Param('id', ParseIntPipe) ownerId: number,
  ): Record<string, any> {
    return this.productsService.getProductByOwnerId(ownerId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Post()
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, CreateProductDto.fields))
  addProduct(
    @Body() createProductDto: CreateProductDto,
    // @Req() req: any,
  ): Record<string, any> {
    return this.productsService.createProduct(createProductDto);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  updateProduct(
    @Param('id', ParseIntPipe) productId: number,
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
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Param('productId', ParseIntPipe) productId: number,
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
  deleteProduct(
    @Param('id', ParseIntPipe) productId: number,
  ): Record<string, any> {
    return this.productsService.deleteProduct(productId);
  }
}
