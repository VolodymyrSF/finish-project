import { Controller, Get, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер сторінки',
    example: 1,
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Колонка для сортування',
    enum: [
      'id',
      'name',
      'surname',
      'email',
      'phone',
      'age',
      'course',
      'course_format',
      'course_type',
      'status',
      'sum',
      'alreadyPaid',
      'created_at',
    ],
    example: 'created_at',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Напрямок сортування',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  async getOrders(
    @Query('page') page: number = 1,
    @Query('orderBy') orderBy: string = 'created_at',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ) {
    const limit = 25;

    const result = await this.ordersService.getOrders(page, limit, orderBy, order);

    return {
      ...result,
      page,
    };
  }
}
