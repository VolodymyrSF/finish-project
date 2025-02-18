import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { OrderAccessGuard } from '../guards/order-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAccessGuard } from '../guards/jwt-access.guard';
import { AddCommentDto } from './dto/add-comment.dto';
import { BaseCommentDto } from './dto/base-comment.dto';
import { Status } from '../../database/entities/enums/order-status.enum';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAccessGuard)
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

  @Post(':id/comment')
  @UseGuards(JwtAccessGuard, OrderAccessGuard)
  @ApiOperation({ summary: 'Add a comment to an order' })
  @ApiResponse({ status: 201, description: 'Comment added successfully', type: BaseCommentDto })
  async addComment(
    @Param('id') id: number,
    @Body() addCommentDto: AddCommentDto,
    @CurrentUser() user: UserEntity,
  ): Promise<{ comment: BaseCommentDto; status: Status; manager: string }> {
    const result = await this.ordersService.addCommentToOrder(id, addCommentDto.comment, user);
    return result;
  }
  @Patch(':id')
  @UseGuards(JwtAccessGuard, OrderAccessGuard)
  @ApiOperation({ summary: 'Edit order' })
  async updateOrder(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: UserEntity,
  ) {
    return await this.ordersService.updateOrder(id, updateOrderDto, user);
  }
}
