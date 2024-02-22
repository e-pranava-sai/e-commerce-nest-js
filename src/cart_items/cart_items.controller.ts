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
  UseInterceptors,
} from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { AuthorizeGuard } from 'src/middleware/authorization.middleware';
import { AuthGuard } from 'src/middleware/authentication.middleware';
import { CreateCartItemDto } from './cart_item.dto';
import { ParseIntPipe } from 'src/pipes/parseInt.pipe';
import { ExtraFieldsInterceptor } from 'src/interceptors/extrafields.interceptor';

@Controller('api/v1/cart-item')
export class CartItemsController {
  constructor(
    private readonly cartItemService: CartItemsService,
    @Inject('REQUEST') private request: { userId: number },
  ) {}

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get()
  getCartItems(): Record<string, any> {
    return this.cartItemService.getCartItems();
  }

  @UseGuards(AuthGuard)
  @Get('user')
  getCartItemsByLoggedUser(): Record<string, any> {
    return this.cartItemService.getCartItemsByUserId(this.request.userId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get(':userId')
  getCartItemsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Record<string, any> {
    return this.cartItemService.getCartItemsByUserId(userId);
  }

  @UseGuards(AuthGuard)
  @Post('user')
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, CreateCartItemDto.fields))
  createCartItemByLoggedUser(
    @Body() createCartItemDto: CreateCartItemDto,
  ): Record<string, any> {
    return this.cartItemService.createCartItemByUserId(
      this.request.userId,
      createCartItemDto,
    );
  }

  @UseGuards(AuthGuard)
  @Put(':cartItemId')
  updateCartItem(
    @Param('cartItemId') cartItemId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Record<string, any> {
    return this.cartItemService.updateCartItem(cartItemId, quantity);
  }

  @UseGuards(AuthGuard)
  @Delete('/user/:cartItemId')
  deleteCartItemByLoggedUser(
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
  ): Record<string, any> {
    return this.cartItemService.deleteCartItem(cartItemId);
  }
}
