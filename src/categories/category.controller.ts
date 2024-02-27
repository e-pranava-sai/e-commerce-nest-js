import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from 'src/middleware/authentication.middleware';
import { AuthorizeGuard } from 'src/middleware/authorization.middleware';
import { CategoryDto } from './category.dto';
import { ExtraFieldsInterceptor } from 'src/interceptors/extrafields.interceptor';
import { ParamParseIntPipe } from 'src/pipes/paramParseInt.pipe';
import { QueryParseIntPipe } from 'src/pipes/queryParseInt.pipe';

@Controller('api/v1/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get('?')
  getCategories(
    @Query('categoryId', QueryParseIntPipe) categoryId: number,
  ): Record<string, any> {
    return this.categoryService.getCategories(categoryId);
  }

  @Get('/:categoryId')
  getProductsByCategory(
    @Param('categoryId', ParamParseIntPipe) categoryId: number,
  ): Record<string, any> {
    return this.categoryService.getProductsByCategory(categoryId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Post()
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, CategoryDto.fields))
  createCategory(@Body() createCategoryDto: CategoryDto): Record<string, any> {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Put('/:id')
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, CategoryDto.fields))
  updateCategory(
    @Param('id', ParamParseIntPipe) categoryId: number,
    @Body() categoryDto: CategoryDto,
  ): Record<string, any> {
    return this.categoryService.updateCategory(categoryId, categoryDto);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Delete('/:id')
  deleteCategory(
    @Param('id', ParamParseIntPipe) categoryId: number,
  ): Record<string, any> {
    return this.categoryService.deleteCategory(categoryId);
  }
}
