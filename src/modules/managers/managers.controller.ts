import { Controller, Post, Body, UseGuards, Get, Param, Put, Patch, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Створення менеджера (тільки для адмінів)' })
  async createManager(@Body() dto: CreateManagerDto) {
    return this.managersService.createManager(dto);
  }

  @Get(':id/activate')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Генерація посилання для активації менеджера (тільки для адмінів)' })
  async generateActivationLink(@Param('id') id: string) {
    return this.managersService.generateActivationLink(id);
  }

  @Get('activate/:token')
  @ApiOperation({ summary: 'Активація менеджера за токеном' })
  async activateManager(@Param('token') token: string) {
    return this.managersService.activateManager(token);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Генерація посилання для скидання пароля' })
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
  @ApiOperation({ summary: 'Заблокувати менеджера (тільки для адмінів)' })
  async banManager(@Param('id') id: string) {
    return this.managersService.changeManagerStatus(id, true);
  }

  @Patch(':id/unban')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Розблокувати менеджера (тільки для адмінів)' })
  async unbanManager(@Param('id') id: string) {
    return this.managersService.changeManagerStatus(id, false);
  }

  @Get('filter')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Отримати список менеджерів з фільтрацією' })
  async filterManagers(@Query() query: { name?: string; email?: string; status?: string }) {
    const { name, email, status } = query;
    return this.managersService.filterManagers(name, email, status);
  }

  @Get(':id/stats')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Отримати статистику менеджера (його заявки)' })
  async getManagerStats(@Param('id') id: string) {
    return this.managersService.getManagerStats(id);
  }
}
