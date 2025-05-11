import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like,DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ManagerEntity } from '../../database/entities/manager.entity';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ManagerRepository } from '../repository/services/manager.repository';
import { OrdersRepository } from '../repository/services/orders.repository';
import { TokenService } from '../auth/services/token.service';
import { TokenType } from '../../database/entities/enums/token-type.enum';
import { UserRepository } from '../repository/services/user.repository';
import { RoleRepository } from '../repository/services/role.repository';
import { RoleEnum } from '../../database/entities/enums/role.enum';
import { RoleEntity } from '../../database/entities/role.entity';

import { runInTransaction } from '../../utils/run-in-transaction';
import { stripPassword } from '../../utils/strip-password';
import { getManagerOrderStats } from '../../utils/get-manager-order-stats';

@Injectable()
export class ManagersService {
  private readonly logger = new Logger(ManagersService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ManagerEntity)
    private readonly managersRepository: ManagerRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly usersRepository: UserRepository,
    private readonly rolesRepository: RoleRepository,
    private readonly tokenService: TokenService,
  ) {}


  async createManager(dto: CreateManagerDto) {
    const existingManager = await this.managersRepository.findOne({ where: { email: dto.email } });
    if (existingManager) {
      throw new BadRequestException('Менеджер з таким email вже існує');
    }

    return runInTransaction(this.dataSource, async (manager) => {
      const newManager = this.managersRepository.create({ ...dto, isActive: false, isBanned: false });
      await manager.save(newManager);

      const role = await manager.findOne(RoleEntity, { where: { name: RoleEnum.MANAGER } });
      if (!role) throw new NotFoundException('Роль менеджера не знайдена');

      const user = this.usersRepository.create({
        id: newManager.id,
        name: dto.name,
        email: dto.email,
        password: '',
        role,
      });

      await manager.save(user);

      return stripPassword(newManager);
    });
  }

  async filterManagers(name?: string, email?: string, surname?: string, status?: string, page: number = 1, limit: number = 10) {
    const where: any = {};
    if (name) where.name = Like(`%${name}%`);
    if (email) where.email = Like(`%${email}%`);
    if(surname) where.surname = Like(`%${surname}%`);
    if (status === 'active') where.isActive = true;
    if (status === 'banned') where.isBanned = true;

    const [data, total] = await this.managersRepository.findAndCount({
      where,
      select: ['id', 'name', 'surname', 'email', 'phone', 'isActive', 'isBanned', 'created_at', 'updated_at'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getManagerById(managerId: string) {
    const manager = await this.managersRepository.findOne({ where: { id: managerId } });
    if (!manager) throw new NotFoundException('Менеджер не знайдений');

    const stats = await getManagerOrderStats(this.ordersRepository, managerId);

    return {
      orderStats: stats,
      manager: stripPassword(manager),
    };
  }

  async getAdminInfo(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role']
    });

    if (!user) throw new NotFoundException('Користувач не знайдений');

    // Для адміна може не бути статистики замовлень, або можна спробувати отримати, якщо потрібно
    // const stats = await getManagerOrderStats(this.ordersRepository, userId);

    return {
      // orderStats: stats, // Якщо потрібна статистика для адміна
      admin: stripPassword(user), // Використовуйте той же метод stripPassword або аналогічний
    };
  }

  async updateManager(managerId: string, dto: Partial<CreateManagerDto>) {
    const manager = await this.managersRepository.findOne({ where: { id: managerId } });
    if (!manager) throw new NotFoundException('Менеджер не знайдений');

    Object.assign(manager, dto);
    await this.managersRepository.save(manager);

    return stripPassword(manager);
  }

  async deleteManager(managerId: string) {
    const manager = await this.managersRepository.findOne({ where: { id: managerId } });
    if (!manager) throw new NotFoundException('Менеджер не знайдений');

    return runInTransaction(this.dataSource, async (runner) => {
      await runner.remove(manager);
      await runner.delete(this.usersRepository.target, { id: manager.id });

      return { message: 'Менеджер успішно видалений' };
    });
  }



  async changeManagerStatus(managerId: string, isBanned: boolean) {
    const manager = await this.managersRepository.findOne({ where: { id: managerId } });
    if (!manager) throw new NotFoundException('Менеджер не знайдений');

    return runInTransaction(this.dataSource, async (runner) => {
      manager.isBanned = isBanned;
      manager.isActive = !isBanned;
      await runner.save(manager);

      return { message: isBanned ? 'Менеджер заблокований' : 'Менеджер розблокований' };
    });
  }


  async getManagerStats(managerId: string) {
    const manager = await this.managersRepository.findOne({ where: { id: managerId } });
    if (!manager) throw new NotFoundException('Менеджер не знайдений');

    const stats = await getManagerOrderStats(this.ordersRepository, managerId);

    return {
      orderStats: stats,
      manager: stripPassword(manager),
    };
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



  async generatePasswordResetLink(email: string) {
    const manager = await this.managersRepository.findOne({ where: { email } });
    if (!manager) {
      throw new NotFoundException('Менеджер не знайдений');
    }
    const payload = { email, type: TokenType.RESET };
    const token = await this.tokenService.signToken(payload, '30m', TokenType.RESET);
    return `http://localhost:3000/managers/activate/reset-password/${token}`;
  }


  async setPassword(dto: UpdatePasswordDto) {
    let payload;
    let isActivation = false;

    try {
      payload = await this.tokenService.verifyToken(dto.token, TokenType.RESET);
    } catch (errorReset) {
      try {
        payload = await this.tokenService.verifyToken(dto.token, TokenType.ACTIVATE);
        isActivation = true;
      } catch (errorActivate) {
        throw new BadRequestException('Недійсний або прострочений токен');
      }
    }

    /*
    if (payload.email !== dto.email) {
      throw new BadRequestException('Токен не відповідає email');
    }

     */

    const emailFromToken = payload.email;

    const manager = await this.managersRepository.findOne({ where: { email: emailFromToken.toLowerCase() } });
    if (!manager || (!manager.isActive && !isActivation)) {
      throw new BadRequestException('Менеджер не знайдений або не активований');
    }

    const user = await this.usersRepository.findOne({ where: { email: emailFromToken.toLowerCase() } });
    if (!user) {
      throw new BadRequestException('Менеджер не знайдений або не активований');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    manager.password = hashedPassword;
    user.password = hashedPassword;

    if (isActivation) {
      manager.isActive = true;
    }

    await this.managersRepository.save(manager);
    await this.usersRepository.save(user);

    return {
      message: isActivation
        ? 'Менеджер активований і пароль встановлено. Тепер можна входити.'
        : 'Пароль успішно скинуто. Тепер можна входити.',
    };


  }

  private async getManagerOrderStats(managerId: string): Promise<Record<string, number>> {
    const allStatuses = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('order.manager_id = :managerId', { managerId })
      .groupBy('order.status')
      .getRawMany();

    const stats: Record<string, number> = {};
    allStatuses.forEach(row => {
      stats[row.status] = Number(row.count);
    });

    return stats;
  }


}
