import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RoleRepository } from '../repository/services/role.repository';
import { UserRepository } from '../repository/services/user.repository';
import { TokenService } from '../auth/services/token.service';
import { RoleEnum } from '../../database/entities/enums/role.enum';
import { Role } from '../../enums/role.enum';
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

      await this.userRepository.save(newAdmin);



    }}
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


      const newManagerEntity = this.managerRepository.create({
        id: savedManager.id,
        name: 'manager',
        email: savedManager.email,
        phone: '1234567890',
      });

      await this.managerRepository.save(newManagerEntity);
    }
  }
}