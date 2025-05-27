import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RoleRepository } from '../repository/services/role.repository';
import { UserRepository } from '../repository/services/user.repository';
import { TokenService } from '../auth/services/token.service';
import { RoleEnum } from '../../database/entities/enums/role.enum';
import { RoleEntity } from '../../database/entities/role.entity';
import { ManagerRepository } from '../repository/services/manager.repository';

@Injectable()
export class SeedService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly managerRepository: ManagerRepository,
  ) {}

  async seed() {
    await this.createRoles();
    await this.createAdminUser();
    await this.createManagerUser();
    await this.syncExistingUsersToManagers(); // Додаємо новий метод
  }

  private async createRoles() {
    const adminRole = await this.roleRepository.findOne({ where: { name: RoleEnum.ADMIN } });
    const managerRole = await this.roleRepository.findOne({ where: { name: RoleEnum.MANAGER } });

    if (!adminRole) {
      await this.roleRepository.save({
        id: uuidv4(),
        name: RoleEnum.ADMIN,
      } as RoleEntity);
    }

    if (!managerRole) {
      await this.roleRepository.save({
        id: uuidv4(),
        name: RoleEnum.MANAGER,
      } as RoleEntity);
    }
  }

  private async createAdminUser() {
    const adminUser = await this.userRepository.findOne({
      where: { email: 'admin@gmail.com' },
    });

    if (!adminUser) {
      const adminRole = await this.roleRepository.findOne({ where: { name: RoleEnum.ADMIN } });
      const hashedPassword = await bcrypt.hash('admin', 10);

      const newAdmin = this.userRepository.create({
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: adminRole,
      });

      const savedAdmin = await this.userRepository.save(newAdmin);
      await this.createManagerEntryForUser(savedAdmin);
    } else {
      await this.createManagerEntryForUser(adminUser); // Перевіряємо і для існуючого адміна
    }
  }

  private async createManagerUser() {
    const managerUser = await this.userRepository.findOne({
      where: { email: 'manager@example.com' },
    });

    if (!managerUser) {
      const managerRole = await this.roleRepository.findOne({ where: { name: RoleEnum.MANAGER } });
      const hashedPassword = await bcrypt.hash('manager', 10);

      const newManager = this.userRepository.create({
        email: 'manager@example.com',
        password: hashedPassword,
        name: 'manager',
        role: managerRole,
      });

      const savedManager = await this.userRepository.save(newManager);
      await this.createManagerEntryForUser(savedManager, 'manager');
    } else {
      await this.createManagerEntryForUser(managerUser, 'manager'); // Перевіряємо і для існуючого менеджера
    }
  }

  private async createManagerEntryForUser(user: any, defaultName?: string) {
    const existingManagerByUserId = await this.managerRepository.findOne({ where: { userId: user.id } });
    const existingManagerByEmail = await this.managerRepository.findOne({ where: { email: user.email } });

    if (!existingManagerByUserId && !existingManagerByEmail) {
      const managerData = {
        userId: user.id,
        email: user.email,
        name: defaultName || user.name || 'No Name',
        phone: '0000000000',
        isActive: true,
        isBanned: false,
      };
      const newManager = this.managerRepository.create(managerData);
      await this.managerRepository.save(newManager);
      console.log(`Створено запис менеджера для користувача з ID: ${user.id}`);
    } else if (existingManagerByUserId && !existingManagerByEmail) {
      // Якщо є запис за userId, але немає за email (можлива неконсистентність), можна оновити email
      existingManagerByUserId.email = user.email;
      await this.managerRepository.save(existingManagerByUserId);
      console.log(`Оновлено email менеджера для користувача з ID: ${user.id}`);
    } else if (!existingManagerByUserId && existingManagerByEmail) {
      // Якщо є запис за email, але немає за userId (можлива неконсистентність), можна оновити userId
      existingManagerByEmail.userId = user.id;
      await this.managerRepository.save(existingManagerByEmail);
      console.log(`Оновлено userId менеджера для email: ${user.email}`);
    }
  }

  // Метод для синхронізації існуючих користувачів з ролями ADMIN/MANAGER
  private async syncExistingUsersToManagers() {
    const adminUsers = await this.userRepository.find({ where: { role: { name: RoleEnum.ADMIN } }, relations: ['role'] });
    for (const user of adminUsers) {
      await this.createManagerEntryForUser(user, 'Admin');
    }

    const managerUsers = await this.userRepository.find({ where: { role: { name: RoleEnum.MANAGER } }, relations: ['role'] });
    for (const user of managerUsers) {
      await this.createManagerEntryForUser(user, 'manager');
    }
    console.log('Синхронізація існуючих користувачів з менеджерами завершена.');
  }
}