import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ManagerEntity } from '../../database/entities/manager.entity';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ManagerRepository } from '../repository/services/manager.repository';
import { OrdersRepository } from '../repository/services/orders.repository';
import { TokenService } from '../auth/services/token.service';
import { TokenType } from '../../database/entities/enums/token-type.enum';

@Injectable()
export class ManagersService {
  constructor(
    @InjectRepository(ManagerEntity)
    private readonly managersRepository: ManagerRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly tokenService: TokenService,
  ) {}

  async createManager(dto: CreateManagerDto) {
    const existingManager = await this.managersRepository.findOne({ where: { email: dto.email } });
    if (existingManager) {
      throw new BadRequestException('Менеджер з таким email вже існує');
    }

    const manager = this.managersRepository.create({ ...dto, isActive: false, isBanned: false });
    await this.managersRepository.save(manager);
    return manager;
  }

  async generateActivationLink(managerId: string) {
    const manager = await this.managersRepository.findOne({ where: { id: managerId } });
    if (!manager) {
      throw new NotFoundException('Менеджер не знайдений');
    }
    if (manager.isActive) {
      throw new BadRequestException('Менеджер вже активований, не можна згенерувати токен повторно');
    }
    const payload = { managerId, email: manager.email, type: TokenType.ACTIVATE };
    const token = await this.tokenService.signToken(payload, '30m', TokenType.ACTIVATE);
    return `http://localhost:3000/managers/activate/${token}`;
  }

  async activateManager(token: string) {
    let payload;
    try {
      payload = await this.tokenService.verifyToken(token, TokenType.ACTIVATE);
    } catch (error) {
      throw new BadRequestException('Недійсний або прострочений токен');
    }
    if (payload.type !== TokenType.ACTIVATE) {
      throw new BadRequestException('Невірний тип токена');
    }
    const manager = await this.managersRepository.findOne({ where: { id: payload.managerId } });
    if (!manager) {
      throw new BadRequestException('Менеджер не знайдений');
    }
    if (manager.isActive) {
      throw new BadRequestException('Менеджер вже активований');
    }
    manager.isActive = true;
    await this.managersRepository.save(manager);
    return { message: 'Менеджер активований. Встановіть пароль.' };
  }

  async generatePasswordResetLink(email: string) {
    const manager = await this.managersRepository.findOne({ where: { email } });
    if (!manager) {
      throw new NotFoundException('Менеджер не знайдений');
    }
    const payload = { email, type: TokenType.RESET };
    const token = await this.tokenService.signToken(payload, '30m', TokenType.RESET);
    return `http://localhost:3000/managers/activate/reset-password/${token}`;
  }

  async validateResetPasswordToken(token: string) {
    let payload;
    try {
      payload = await this.tokenService.verifyToken(token, TokenType.RESET);
    } catch (error) {
      throw new BadRequestException('Недійсний або прострочений токен');
    }
    if (payload.type !== TokenType.RESET) {
      throw new BadRequestException('Невірний тип токена');
    }
    return { message: 'Токен дійсний, перейдіть до встановлення нового пароля.', email: payload.email };
  }

  async setPassword(dto: UpdatePasswordDto) {
    let payload;

    try {
      payload = await this.tokenService.verifyToken(dto.token, TokenType.RESET);
    } catch (errorReset) {
      try {
        payload = await this.tokenService.verifyToken(dto.token, TokenType.ACTIVATE);
      } catch (errorActivate) {
        throw new BadRequestException('Недійсний або прострочений токен');
      }
    }


    if (payload.email !== dto.email) {
      throw new BadRequestException('Токен не відповідає email');
    }


    const manager = await this.managersRepository.findOne({ where: { email: dto.email } });
    if (!manager || !manager.isActive) {
      throw new BadRequestException('Менеджер не знайдений або не активований');
    }


    manager.password = await bcrypt.hash(dto.password, 10);
    await this.managersRepository.save(manager);

    return { message: 'Пароль встановлено. Тепер ви можете увійти.' };
  }


  async changeManagerStatus(managerId: string, isBanned: boolean) {
    const manager = await this.managersRepository.findOne({ where: { id: managerId } });
    if (!manager) {
      throw new NotFoundException('Менеджер не знайдений');
    }
    manager.isBanned = isBanned;
    manager.isActive = !isBanned;
    await this.managersRepository.save(manager);
    return { message: isBanned ? 'Менеджер заблокований' : 'Менеджер розблокований' };
  }

  async filterManagers(name?: string, email?: string, status?: string, page: number = 1, limit: number = 10) {
    const where: any = {};
    if (name) where.name = Like(`%${name}%`);
    if (email) where.email = Like(`%${email}%`);
    if (status === 'active') where.isActive = true;
    if (status === 'banned') where.isBanned = true;

    const [data, total] = await this.managersRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getManagerStats(managerId: string) {
    const orders = await this.ordersRepository.find({ where: { manager: { id: managerId } } });
    const managerInfo = await this.managersRepository.findOne({ where: { id: managerId } });
    const totalOrders = orders.length;
    return { totalOrders, managerInfo };
  }
}
