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
import { OrderItemsService } from './order_items.service';
import { AuthGuard } from 'src/middleware/authentication.middleware';
import { AuthorizeGuard } from 'src/middleware/authorization.middleware';
import { ParamParseIntPipe } from 'src/pipes/paramParseInt.pipe';
import { CreateOrderItemDto } from './order_item.dto';

@Controller('api/v1/order-item')
export class OrderItemsController {
  constructor(
    @Inject('REQUEST') private readonly request: { userId: number },
    private readonly orderItemsService: OrderItemsService,
  ) {}

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get()
  getOrderItems(): Record<string, any> {
    return this.orderItemsService.getOrderItems();
  }

  @UseGuards(AuthGuard)
  @Get('user')
  getOrderItemsByLoggedUser(): Record<string, any> {
    return this.orderItemsService.getOrderItemsByUserId(this.request.userId);
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Get(':userId')
  getOrderItemsByUserId(
    @Param('userId', ParamParseIntPipe) userId: number,
  ): Record<string, any> {
    return this.orderItemsService.getOrderItemsByUserId(userId);
  }

  @UseGuards(AuthGuard)
  @Post('user/:orderId')
  createOrderItemByLoggedUserOrderId(
    @Param('orderId', ParamParseIntPipe) orderId: number,
    @Body() createOrderItemDto: CreateOrderItemDto,
  ): Record<string, any> {
    return this.orderItemsService.createOrderItemByUserIdOrderId(
      this.request.userId,
      orderId,
      createOrderItemDto,
    );
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Post(':userId/:orderId')
  createOrderItemByUserIdOrderId(
    @Param('userId', ParamParseIntPipe) userId: number,
    @Param('orderId', ParamParseIntPipe) orderId: number,
    @Body() createOrderItemDto: CreateOrderItemDto,
  ): Record<string, any> {
    return this.orderItemsService.createOrderItemByUserIdOrderId(
      userId,
      orderId,
      createOrderItemDto,
    );
  }

  @UseGuards(AuthGuard, AuthorizeGuard)
  @Delete(':orderItemId')
  deleteOrderItem(
    @Param('orderItemId', ParamParseIntPipe) orderItemId: number,
  ): Record<string, any> {
    return this.orderItemsService.deleteOrderItem(orderItemId);
  }
}
