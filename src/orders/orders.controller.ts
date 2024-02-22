import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from 'src/middleware/authentication.middleware';
import { AuthorizeGuard } from 'src/middleware/authorization.middleware';
import { ParseIntPipe } from 'src/pipes/parseInt.pipe';
import { CreateOrderDto } from './order.dto';
import { ExtraFieldsInterceptor } from 'src/interceptors/extrafields.interceptor';

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
  getOrderByUserIdParam(
    @Param('userId', ParseIntPipe) userId: number,
  ): Record<string, any> {
    return this.ordersService.getOrderByUserId(userId);
  }

  @UseGuards(AuthGuard)
  @Post('user')
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, CreateOrderDto.fields))
  createOrder(@Body() createOrderDto: CreateOrderDto): Record<string, any> {
    return this.ordersService.createOrderByUserId(
      createOrderDto,
      this.request.userId,
    );
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Post(':userId')
  @UseInterceptors(ExtraFieldsInterceptor.bind(this, CreateOrderDto.fields))
  createOrderByUserId(
    @Body() createOrderDto: CreateOrderDto,
    @Param('userId', ParseIntPipe) userId: number,
  ): Record<string, any> {
    return this.ordersService.createOrderByUserId(createOrderDto, userId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Delete(':orderId')
  deleteOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Record<string, any> {
    return this.ordersService.deleteOrderByOrderId(orderId);
  }
}
