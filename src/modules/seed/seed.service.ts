import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RoleRepository } from '../repository/services/role.repository';
import { UserRepository } from '../repository/services/user.repository';
import { TokenService } from '../auth/services/token.service';
import { RoleEnum } from '../../database/entities/enums/role.enum';
import { Role } from '../../enums/role.enum';
import { RoleEntity } from '../../database/entities/role.entity'; // Імпортуємо генератор UUID

@Injectable()
export class SeedService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async seed() {
    await this.createRoles();
    await this.createAdminUser();
  }

  private async createRoles() {
    const adminRole = await this.roleRepository.findOne({ where: { name: RoleEnum.ADMIN } });
    const managerRole = await this.roleRepository.findOne({ where: { name: RoleEnum.MANAGER } });

    // Якщо ролі не існують, створюємо їх з унікальними UUID
    if (!adminRole) {
      await this.roleRepository.save({
        id: uuidv4(),  // Генеруємо UUID для Admin
        name: RoleEnum.ADMIN,
      } as RoleEntity);
    }

    if (!managerRole) {
      await this.roleRepository.save({
        id: uuidv4(),  // Генеруємо UUID для Manager
        name: RoleEnum.MANAGER,
      } as RoleEntity);
    }
  }

  private async createAdminUser() {
    const adminUser = await this.userRepository.findOne({
      where: { email: 'admin@gmail.com' },
    });

    if (!adminUser) {
      // Якщо немає користувача, створюємо нового адміністратора
      const adminRole = await this.roleRepository.findOne({ where: { name: RoleEnum.ADMIN } });

      const hashedPassword = await bcrypt.hash('admin', 10);

      const newAdmin = this.userRepository.create({
        email: 'admin@gmail.com',
        password: hashedPassword,  // Збережемо хешований пароль
        role: adminRole,
      });

      await this.userRepository.save(newAdmin);
    }
  }
}
