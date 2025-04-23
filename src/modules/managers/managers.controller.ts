import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Put,
  Patch,
  Query,
  BadRequestException,
  Delete, Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAccessGuard } from '../guards/jwt-access.guard';
import { AdminGuard } from '../guards/admin.guard';
import { RoleEnum } from '../../database/entities/enums/role.enum';

@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Post()
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Створення менеджера' })
  async createManager(@Body() dto: CreateManagerDto) {
    return this.managersService.createManager(dto);
  }


  @Get()
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Отримати список менеджерів' })
  @ApiQuery({ name: 'name', required: false, description: 'Фільтр за ім’ям' })
  @ApiQuery({ name: 'email', required: false, description: 'Фільтр за email' })
  @ApiQuery({ name: 'surname', required: false, description: 'Фільтр за прізвищем' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'banned'], description: 'Фільтр за статусом' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Кількість менеджерів на сторінку' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер сторінки' })
  async getManagers(@Query() query: { name?: string; email?: string; surname?: string; status?: string; limit?: string; page?: string }) {
    const { name, email,surname, status } = query;
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    return this.managersService.filterManagers(name, email,surname, status, page, limit);
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Отримати інформацію про поточного менеджера' })
  async getCurrentManager(@Req() req) {
    if (req.user.role.name === RoleEnum.MANAGER) {
      return this.managersService.getManagerById(req.user.id);
    } else if (req.user.role.name === RoleEnum.ADMIN) {
      return this.managersService.getAdminInfo(req.user.id);
    }
  }


  @Put('set-password')
  @ApiOperation({ summary: 'Активація менеджера Або скидання паролю' })
  @UseGuards(JwtAccessGuard, AdminGuard)
  async setPassword(@Body() dto: UpdatePasswordDto) {
    return this.managersService.setPassword(dto);
  }

  @Post('reset-password')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Генерація посилання для скидання пароля' })
  async resetPassword(@Body('email') email: string) {
    return this.managersService.generatePasswordResetLink(email);
  }


  @Get(':id')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Отримати інформацію про менеджера за ID' })
  async getManagerById(@Param('id') id: string) {
    return this.managersService.getManagerById(id);
  }

  @Put(':id')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Оновити дані менеджера' })
  async updateManager(@Param('id') id: string, @Body() dto: Partial<CreateManagerDto>) {
    return this.managersService.updateManager(id, dto);
  }


  @Delete(':id')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Видалити менеджера' })
  async deleteManager(@Param('id') id: string) {
    return this.managersService.deleteManager(id);
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

  @Get(':id/stats')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Отримати статистику менеджера' })
  async getManagerStats(@Param('id') id: string) {
    return this.managersService.getManagerStats(id);
  }

  @Get(':id/activate')
  @UseGuards(JwtAccessGuard, AdminGuard)
  @ApiOperation({ summary: 'Генерація посилання для активації менеджера' })
  async generateActivationLink(@Param('id') id: string) {
    return this.managersService.generateActivationLink(id);
  }





}
