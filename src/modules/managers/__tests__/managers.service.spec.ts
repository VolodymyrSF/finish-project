import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ManagersService } from '../managers.service';
import { TokenService } from '../../auth/services/token.service';
import { ManagerEntity } from '../../../database/entities/manager.entity';
import { CreateManagerDto } from '../dto/create-manager.dto';
import { RoleEnum } from '../../../database/entities/enums/role.enum';
import { RoleEntity } from '../../../database/entities/role.entity';
import { TokenType } from '../../../database/entities/enums/token-type.enum';
import { UpdatePasswordDto } from '../dto/update-password.dto';



import { stripPassword } from '../../../utils/strip-password';
// Mock implementations
jest.mock('bcrypt');
jest.mock('../../../utils/run-in-transaction', () => ({
  runInTransaction: jest.fn((dataSource, callback) => callback(mockEntityManager)),
}));
jest.mock('../../../utils/strip-password', () => ({
  stripPassword: jest.fn(entity => {
    const { password, ...rest } = entity;
    return rest;
  }),
}));
jest.mock('../../../utils/get-manager-order-stats', () => ({
  getManagerOrderStats: jest.fn(() => ({
    completed: 5,
    processing: 2,
    pending: 3,
  })),
}));


// Setup mock entity manager
const mockEntityManager = {
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
  findOne: jest.fn(),
};

// Mock repositories
const mockManagerRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  })),
};

const mockOrdersRepository = {
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  })),
};

const mockUserRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockRoleRepository = {
  findOne: jest.fn(),
};

const mockTokenService = {
  signToken: jest.fn(),
  verifyToken: jest.fn(),
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: mockEntityManager,
  }),
};

describe('ManagersService', () => {
  let service: ManagersService;
  let managerRepository: Repository<ManagerEntity>;
  let userRepository: any;
  let roleRepository: any;
  let tokenService: TokenService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagersService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(ManagerEntity),
          useValue: mockManagerRepository,
        },
        {
          provide: 'OrdersRepository',
          useValue: mockOrdersRepository,
        },
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'RoleRepository',
          useValue: mockRoleRepository,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    service = module.get<ManagersService>(ManagersService);
    managerRepository = module.get<Repository<ManagerEntity>>(getRepositoryToken(ManagerEntity));
    userRepository = module.get('UserRepository');
    roleRepository = module.get('RoleRepository');
    tokenService = module.get<TokenService>(TokenService);
    dataSource = module.get<DataSource>(DataSource);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createManager', () => {
    const createManagerDto: CreateManagerDto = {
      name: 'Олександр',
      surname: 'Петренко',
      email: 'alex@example.com',
      phone: '+380971234567',
    };

    const mockManager = {
      id: 'test-id',
      ...createManagerDto,
      isActive: false,
      isBanned: false,
    };

    const mockRole = {
      id: 'role-id',
      name: RoleEnum.MANAGER,
    };

    it('should create a manager and user', async () => {
      mockManagerRepository.findOne.mockResolvedValue(null);
      mockManagerRepository.create.mockReturnValue(mockManager);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockUserRepository.create.mockReturnValue({ id: mockManager.id, name: mockManager.name, email: mockManager.email });

      await service.createManager(createManagerDto);

      expect(mockManagerRepository.findOne).toHaveBeenCalledWith({ where: { email: createManagerDto.email } });
      expect(mockManagerRepository.create).toHaveBeenCalledWith({
        ...createManagerDto,
        isActive: false,
        isBanned: false,
      });
      expect(mockEntityManager.save).toHaveBeenCalledWith(mockManager);
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(RoleEntity, { where: { name: RoleEnum.MANAGER } });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        id: mockManager.id,
        name: mockManager.name,
        email: mockManager.email,
        password: '',
        role: mockRole,
      });
      expect(mockEntityManager.save).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException if manager with the same email exists', async () => {
      mockManagerRepository.findOne.mockResolvedValue({ id: 'existing-id', email: createManagerDto.email });

      await expect(service.createManager(createManagerDto)).rejects.toThrow(
        new BadRequestException('Менеджер з таким email вже існує')
      );
    });

    it('should throw NotFoundException if manager role not found', async () => {
      mockManagerRepository.findOne.mockResolvedValue(null);
      mockManagerRepository.create.mockReturnValue(mockManager);
      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(service.createManager(createManagerDto)).rejects.toThrow(
        new NotFoundException('Роль менеджера не знайдена')
      );
    });
  });

  describe('filterManagers', () => {
    it('should return filtered managers with pagination', async () => {
      const managers = [
        { id: 'test-id-1', name: 'Олександр', email: 'alex@example.com' },
        { id: 'test-id-2', name: 'Петро', email: 'petro@example.com' },
      ];

      mockManagerRepository.findAndCount.mockResolvedValue([managers, 2]);

      const result = await service.filterManagers('Олександр', undefined, undefined, 'active', 1, 10);

      expect(mockManagerRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          name: expect.anything(),
          isActive: true,
        },
        select: ['id', 'name', 'surname', 'email', 'phone', 'isActive', 'isBanned', 'created_at', 'updated_at'],
        order: { created_at: 'DESC' },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        data: managers,
        total: 2,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getManagerById', () => {
    it('should return manager and order stats', async () => {
      const manager = {
        id: 'test-id',
        name: 'Олександр',
        email: 'alex@example.com',
        password: 'hashed_password',
      };

      mockManagerRepository.findOne.mockResolvedValue(manager);

      const result = await service.getManagerById('test-id');

      expect(mockManagerRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(result).toEqual({
        manager: {
          id: 'test-id',
          name: 'Олександр',
          email: 'alex@example.com',
        },
        orderStats: {
          completed: 5,
          processing: 2,
          pending: 3,
        },
      });
    });

    it('should throw NotFoundException if manager not found', async () => {
      mockManagerRepository.findOne.mockResolvedValue(null);

      await expect(service.getManagerById('test-id')).rejects.toThrow(
        new NotFoundException('Менеджер не знайдений')
      );
    });
  });

  describe('getAdminInfo', () => {
    it('should return admin info', async () => {
      const admin = {
        id: 'admin-id',
        name: 'Admin',
        email: 'admin@example.com',
        password: 'hashed_password',
        role: { name: RoleEnum.ADMIN },
      };

      mockUserRepository.findOne.mockResolvedValue(admin);

      const result = await service.getAdminInfo('admin-id');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'admin-id' },
        relations: ['role'],
      });
      expect(result).toEqual({
        admin: {
          id: 'admin-id',
          name: 'Admin',
          email: 'admin@example.com',
          role: { name: RoleEnum.ADMIN },
        },
      });
    });

    it('should throw NotFoundException if admin not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getAdminInfo('admin-id')).rejects.toThrow(
        new NotFoundException('Користувач не знайдений')
      );
    });
  });

  describe('updateManager', () => {
    it('should update manager', async () => {
      const manager = {
        id: 'test-id',
        name: 'Олександр',
        email: 'alex@example.com',
      };

      const updateDto = {
        name: 'Новий Олександр',
        phone: '+380971234599',
      };

      const updatedManager = {
        ...manager,
        ...updateDto,
      };

      mockManagerRepository.findOne.mockResolvedValue(manager);
      mockManagerRepository.save.mockResolvedValue(updatedManager);

      const result = await service.updateManager('test-id', updateDto);

      expect(mockManagerRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(mockManagerRepository.save).toHaveBeenCalledWith({
        ...manager,
        ...updateDto,
      });
      expect(result).toEqual(updatedManager);
    });

    it('should throw NotFoundException if manager not found', async () => {
      mockManagerRepository.findOne.mockResolvedValue(null);

      await expect(service.updateManager('test-id', { name: 'Новий Олександр' })).rejects.toThrow(
        new NotFoundException('Менеджер не знайдений')
      );
    });
  });

  describe('deleteManager', () => {
    it('should delete manager and user', async () => {
      const manager = {
        id: 'test-id',
        name: 'Олександр',
        email: 'alex@example.com',
      };

      mockManagerRepository.findOne.mockResolvedValue(manager);

      await service.deleteManager('test-id');

      expect(mockManagerRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(mockEntityManager.remove).toHaveBeenCalledWith(manager);
      expect(mockEntityManager.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if manager not found', async () => {
      mockManagerRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteManager('test-id')).rejects.toThrow(
        new NotFoundException('Менеджер не знайдений')
      );
    });
  });

  describe('changeManagerStatus', () => {
    it('should ban manager', async () => {
      const manager = {
        id: 'test-id',
        name: 'Олександр',
        email: 'alex@example.com',
        isBanned: false,
        isActive: true,
      };

      mockManagerRepository.findOne.mockResolvedValue(manager);

      await service.changeManagerStatus('test-id', true);

      expect(mockManagerRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(mockEntityManager.save).toHaveBeenCalledWith({
        ...manager,
        isBanned: true,
        isActive: false,
      });
    });

    it('should unban manager', async () => {
      const manager = {
        id: 'test-id',
        name: 'Олександр',
        email: 'alex@example.com',
        isBanned: true,
        isActive: false,
      };

      mockManagerRepository.findOne.mockResolvedValue(manager);

      await service.changeManagerStatus('test-id', false);

      expect(mockManagerRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(mockEntityManager.save).toHaveBeenCalledWith({
        ...manager,
        isBanned: false,
        isActive: true,
      });
    });

    it('should throw NotFoundException if manager not found', async () => {
      mockManagerRepository.findOne.mockResolvedValue(null);

      await expect(service.changeManagerStatus('test-id', true)).rejects.toThrow(
        new NotFoundException('Менеджер не знайдений')
      );
    });
  });

  describe('generateActivationLink', () => {
    it('should generate activation link', async () => {
      const manager = {
        id: 'test-id',
        name: 'Олександр',
        email: 'alex@example.com',
        isActive: false,
      };

      mockManagerRepository.findOne.mockResolvedValue(manager);
      mockTokenService.signToken.mockResolvedValue('test-token');

      const result = await service.generateActivationLink('test-id');

      expect(mockManagerRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(mockTokenService.signToken).toHaveBeenCalledWith(
        { managerId: 'test-id', email: 'alex@example.com', type: TokenType.ACTIVATE },
        '30m',
        TokenType.ACTIVATE
      );
      expect(result).toBe('http://localhost:3000/managers/activate/test-token');
    });

    it('should throw NotFoundException if manager not found', async () => {
      mockManagerRepository.findOne.mockResolvedValue(null);

      await expect(service.generateActivationLink('test-id')).rejects.toThrow(
        new NotFoundException('Менеджер не знайдений')
      );
    });

    it('should throw BadRequestException if manager already active', async () => {
      const manager = {
        id: 'test-id',
        name: 'Олександр',
        email: 'alex@example.com',
        isActive: true,
      };

      mockManagerRepository.findOne.mockResolvedValue(manager);

      await expect(service.generateActivationLink('test-id')).rejects.toThrow(
        new BadRequestException('Менеджер вже активований, не можна згенерувати токен повторно')
      );
    });
  });

  describe('generatePasswordResetLink', () => {
    it('should generate password reset link', async () => {
      const manager = {
        id: 'test-id',
        name: 'Олександр',
        email: 'alex@example.com',
      };

      mockManagerRepository.findOne.mockResolvedValue(manager);
      mockTokenService.signToken.mockResolvedValue('test-token');

      const result = await service.generatePasswordResetLink('alex@example.com');

      expect(mockManagerRepository.findOne).toHaveBeenCalledWith({ where: { email: 'alex@example.com' } });
      expect(mockTokenService.signToken).toHaveBeenCalledWith(
        { email: 'alex@example.com', type: TokenType.RESET },
        '30m',
        TokenType.RESET
      );
      expect(result).toBe('http://localhost:3000/managers/activate/reset-password/test-token');
    });

    it('should throw NotFoundException if manager not found', async () => {
      mockManagerRepository.findOne.mockResolvedValue(null);

      await expect(service.generatePasswordResetLink('alex@example.com')).rejects.toThrow(
        new NotFoundException('Менеджер не знайдений')
      );
    });
  });

  describe('setPassword', () => {
    const updatePasswordDto: UpdatePasswordDto = {
      email: 'alex@example.com',
      password: 'SecurePass123!',
      token: 'test-token',
    };

    it('should set password for password reset', async () => {
      const manager = {
        id: 'test-id',
        email: 'alex@example.com',
        isActive: true,
        isBanned: false,
      };

      const user = {
        id: 'test-id',
        email: 'alex@example.com',
        password: 'old-password',
      };

      mockTokenService.verifyToken.mockImplementation((token, type) => {
        if (type === TokenType.RESET) {
          return Promise.resolve({ email: 'alex@example.com', type: TokenType.RESET });
        }
        return Promise.reject(new Error('Invalid token'));
      });

      mockManagerRepository.findOne.mockResolvedValue(manager);
      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new_password');

      await service.setPassword(updatePasswordDto);

      expect(mockTokenService.verifyToken).toHaveBeenCalledWith('test-token', TokenType.RESET);
      expect(mockManagerRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'alex@example.com'.toLowerCase() }
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'alex@example.com'.toLowerCase() }
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 10);
      expect(mockManagerRepository.save).toHaveBeenCalledWith({
        ...manager,
        password: 'hashed_new_password',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...user,
        password: 'hashed_new_password',
      });
    });

    it('should activate manager and set password for activation token', async () => {
      const manager = {
        id: 'test-id',
        email: 'alex@example.com',
        isActive: false,
        isBanned: false,
      };

      const user = {
        id: 'test-id',
        email: 'alex@example.com',
        password: '',
      };

      mockTokenService.verifyToken.mockImplementation((token, type) => {
        if (type === TokenType.RESET) {
          return Promise.reject(new Error('Invalid token'));
        } else if (type === TokenType.ACTIVATE) {
          return Promise.resolve({ email: 'alex@example.com', type: TokenType.ACTIVATE });
        }
      });

      mockManagerRepository.findOne.mockResolvedValue(manager);
      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new_password');

      await service.setPassword(updatePasswordDto);

      expect(mockTokenService.verifyToken).toHaveBeenCalledWith('test-token', TokenType.RESET);
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith('test-token', TokenType.ACTIVATE);
      expect(mockManagerRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'alex@example.com'.toLowerCase() }
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'alex@example.com'.toLowerCase() }
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 10);
      expect(mockManagerRepository.save).toHaveBeenCalledWith({
        ...manager,
        password: 'hashed_new_password',
        isActive: true,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...user,
        password: 'hashed_new_password',
      });
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockTokenService.verifyToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.setPassword(updatePasswordDto)).rejects.toThrow(
        new BadRequestException('Недійсний або прострочений токен')
      );
    });

    it('should throw BadRequestException if token email does not match dto email', async () => {
      mockTokenService.verifyToken.mockResolvedValue({
        email: 'different@example.com',
        type: TokenType.RESET
      });

      await expect(service.setPassword(updatePasswordDto)).rejects.toThrow(
        new BadRequestException('Токен не відповідає email')
      );
    });

    it('should throw BadRequestException if manager not found', async () => {
      mockTokenService.verifyToken.mockResolvedValue({
        email: 'alex@example.com',
        type: TokenType.RESET
      });
      mockManagerRepository.findOne.mockResolvedValue(null);

      await expect(service.setPassword(updatePasswordDto)).rejects.toThrow(
        new BadRequestException('Менеджер не знайдений або не активований')
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      mockTokenService.verifyToken.mockResolvedValue({
        email: 'alex@example.com',
        type: TokenType.RESET
      });

      const manager = {
        id: 'test-id',
        email: 'alex@example.com',
        isActive: true,
      };

      mockManagerRepository.findOne.mockResolvedValue(manager);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.setPassword(updatePasswordDto)).rejects.toThrow(
        new BadRequestException('Менеджер не знайдений або не активований')
      );
    });
  });
});