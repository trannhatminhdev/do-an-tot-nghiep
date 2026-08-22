import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { OrdersService } from '../../application/services/orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';

@Controller('orders')
export class UserOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get('lookup')
  lookupOrders(
    @Query('search') search: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.ordersService.getAllOrders(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
      search || '',
    );
  }

  @Get('my-orders')
  getMyOrders(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.ordersService.getMyOrders(
      userId,
      skip ? parseInt(skip, 10) : undefined,
      take ? parseInt(take, 10) : undefined,
    );
  }

  @Get(':id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderById(id);
  }
}
