import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from 'src/middleware/authentication.middleware';
import { AuthorizeGuard } from 'src/middleware/authorization.middleware';

@Controller('api/v1/orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject('REQUEST') private readonly request: { userId: number },
  ) {}

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get()
  getOrders(): Record<string, any> {
    return this.ordersService.getOrders();
  }

  @UseGuards(AuthGuard)
  @Get('user')
  getOrderByUserId(): Record<string, any> {
    return this.ordersService.getOrderByUserId(this.request.userId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get(':userId')
  getOrderByUserIdParam(@Param('userId') userId: number): Record<string, any> {
    return this.ordersService.getOrderByUserId(userId);
  }

  @UseGuards(AuthGuard)
  @Post('user')
  createOrder(
    @Body('address') address: string,
    @Body('phone') phone: string,
  ): Record<string, any> {
    return this.ordersService.createOrderByUserId(
      address,
      phone,
      this.request.userId,
    );
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Post(':userId')
  createOrderByUserId(
    @Body('address') address: string,
    @Body('phone') phone: string,
    @Param('userId') userId: number,
  ): Record<string, any> {
    return this.ordersService.createOrderByUserId(address, phone, userId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Delete(':orderId')
  deleteOrder(@Param('orderId') orderId: number): Record<string, any> {
    return this.ordersService.deleteOrderByOrderId(orderId);
  }
}
