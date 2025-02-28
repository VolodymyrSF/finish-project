import { Controller, Post, Body, UseGuards, Get, Param, Put, Patch, Query, BadRequestException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAccessGuard } from '../guards/jwt-access.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Post('create-manager')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Створення менеджера ' })
  async createManager(@Body() dto: CreateManagerDto) {
    return this.managersService.createManager(dto);
  }

  @Get(':id/activate')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Генерація посилання для активації менеджера' })
  async generateActivationLink(@Param('id') id: string) {
    return this.managersService.generateActivationLink(id);
  }

  @Get('activate/:token')
  @ApiOperation({ summary: 'Перевірка токена для активації менеджера' })
  async activateManager(@Param('token') token: string) {
    return this.managersService.activateManager(token);
  }

  @Get('activate/reset-password/:token')
  @ApiOperation({ summary: 'Перевірка токена для скидання пароля' })
  async validateResetPasswordToken(@Param('token') token: string) {
    return this.managersService.validateResetPasswordToken(token);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Генерація посилання для скидання пароля' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Електронна пошта менеджера для скидання пароля',
        },
      },
      required: ['email'],
    },
  })
  async resetPassword(@Body('email') email: string) {
    return this.managersService.generatePasswordResetLink(email);
  }

  @Put('set-password')
  @ApiOperation({ summary: 'Встановлення нового пароля' })
  async setPassword(@Body() dto: UpdatePasswordDto) {
    return this.managersService.setPassword(dto);
  }

  @Patch(':id/ban')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Заблокувати менеджера' })
  async banManager(@Param('id') id: string) {
    return this.managersService.changeManagerStatus(id, true);
  }

  @Patch(':id/unban')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Розблокувати менеджера' })
  async unbanManager(@Param('id') id: string) {
    return this.managersService.changeManagerStatus(id, false);
  }

  @Get('filter')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Отримати список менеджерів з фільтрацією та пагінацією' })
  @ApiQuery({ name: 'name', required: false, description: 'Фільтр за ім’ям' })
  @ApiQuery({ name: 'email', required: false, description: 'Фільтр за email' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Фільтр за статусом',
    enum: ['active', 'banned'],
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Кількість менеджерів на сторінку', type: Number })
  @ApiQuery({ name: 'page', required: false, description: 'Номер сторінки', type: Number })
  async filterManagers(@Query() query: { name?: string; email?: string; status?: string; limit?: string; page?: string }) {
    const { name, email, status } = query;
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    return this.managersService.filterManagers(name, email, status, page, limit);
  }

  @Get(':id/stats')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Отримати статистику менеджера' })
  async getManagerStats(@Param('id') id: string) {
    return this.managersService.getManagerStats(id);
  }
}
