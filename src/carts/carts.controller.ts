import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AuthorizeGuard } from 'src/middleware/authorization.middleware';
import { AuthGuard } from 'src/middleware/authentication.middleware';

@Controller('api/v1/cart')
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
    @Inject('REQUEST') private request: { userId: number },
  ) {}

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get()
  getCarts(): Record<string, any> {
    return this.cartsService.getCarts();
  }

  @UseGuards(AuthGuard)
  @Get('user')
  getCart(): Record<string, any> {
    return this.cartsService.getCartByUserId(this.request.userId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get(':userId')
  getCartByUserId(userId: number): Record<string, any> {
    return this.cartsService.getCartByUserId(userId);
  }

  @UseGuards(AuthGuard)
  @Post('user')
  createCart(): Record<string, any> {
    return this.cartsService.createCartByUserId(this.request.userId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Post(':userId')
  createCartByUserId(userId: number): Record<string, any> {
    return this.cartsService.createCartByUserId(userId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Delete(':userId')
  deleteCart(@Param('userId') userId: number): Record<string, any> {
    return this.cartsService.deleteCartByUserId(userId);
  }
}
