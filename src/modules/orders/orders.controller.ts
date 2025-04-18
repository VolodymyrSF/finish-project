import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { OrderAccessGuard } from '../guards/order-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAccessGuard } from '../guards/jwt-access.guard';
import { AddCommentDto } from './dto/req/add-comment.dto';
import { BaseCommentDto } from './dto/res/base-comment.dto';
import { Status } from '../../database/entities/enums/order-status.enum';
import { UpdateOrderDto } from './dto/req/update-order.dto';
import { FilterOrdersDto } from './dto/req/filter-orders.dto';
import { exportOrdersToExcel } from '../../helpers/excel-export.helper';
import { Response } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}



  @Get('')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Отримати заявки з фільтрацією, пагінацією та сортуванням' })
  async getOrders(
    @Query() filters: FilterOrdersDto,
    @CurrentUser() user: UserEntity,
  ) {
    const {
      page = 1,
      orderBy = 'created_at',
      order = 'DESC',
      ...filterParams
    } = filters;

    if (Object.keys(filterParams).length > 0) {
      return await this.ordersService.getFilteredOrders({ page, orderBy, order, ...filterParams }, user);
    }

    const limit = 25;
    const result = await this.ordersService.getOrders(page, limit, orderBy, order);

    return {
      ...result,
      page,
    };
  }

  @Post(':id/comment')
  @UseGuards(JwtAccessGuard, OrderAccessGuard)
  @ApiOperation({ summary: 'Додавання коментаря до заявки' })
  @ApiResponse({ status: 201, description: 'Коментар успішно доданий', type: BaseCommentDto })
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
  @ApiOperation({ summary: 'Редагування заявки' })
  async updateOrder(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: UserEntity,
  ) {
    return await this.ordersService.updateOrder(id, updateOrderDto, user);
  }

  @Get('export')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Експорт заявок в Excel' })
  async exportOrders(@Query() filters: FilterOrdersDto, @CurrentUser() user: UserEntity, @Res() res: Response) {
    const orders = await this.ordersService.getFilteredOrders(filters, user);
    return exportOrdersToExcel(orders, res);
  }




}
