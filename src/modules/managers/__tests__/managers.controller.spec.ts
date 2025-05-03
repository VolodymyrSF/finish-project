import { Test, TestingModule } from '@nestjs/testing';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ManagersController } from '../managers.controller';
import { ManagersService } from '../managers.service';
import { CreateManagerDto } from '../dto/create-manager.dto';

import { UpdatePasswordDto } from '../dto/update-password.dto';
import { RoleEnum } from '../../../database/entities/enums/role.enum';
import { JwtAccessGuard } from '../../guards/jwt-access.guard';
import { AuthModule } from '../../auth/auth.module';

import configuration from '../../../config/configuration';
import { ConfigModule } from '@nestjs/config';

describe('ManagersController', () => {
  let controller: ManagersController;
  let service: ManagersService;

  // Mock service
  const mockManagersService = {
    createManager: jest.fn(),
    filterManagers: jest.fn(),
    getManagerById: jest.fn(),
    getAdminInfo: jest.fn(),
    updateManager: jest.fn(),
    deleteManager: jest.fn(),
    changeManagerStatus: jest.fn(),
    getManagerStats: jest.fn(),
    generateActivationLink: jest.fn(),
    generatePasswordResetLink: jest.fn(),
    setPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, ConfigModule.forRoot({
        isGlobal: true,
        load: [configuration],
      }),],
      controllers: [ManagersController],
      providers: [
        {
          provide: ManagersService,
          useValue: mockManagersService,
        },
        {
          provide: JwtAccessGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<ManagersController>(ManagersController);
    service = module.get<ManagersService>(ManagersService);

    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createManager', () => {
    it('should create a manager', async () => {
      const createManagerDto: CreateManagerDto = {
        name: 'Олександр',
        surname: 'Петренко',
        email: 'alex@example.com',
        phone: '+380971234567',
      };

      const expectedResult = {
        id: 'test-id',
        ...createManagerDto,
        isActive: false,
        isBanned: false,
      };

      mockManagersService.createManager.mockResolvedValue(expectedResult);

      const result = await controller.createManager(createManagerDto);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.createManager).toHaveBeenCalledWith(createManagerDto);
    });

    it('should throw an error if manager already exists', async () => {
      const createManagerDto: CreateManagerDto = {
        name: 'Олександр',
        email: 'alex@example.com',
      };

      mockManagersService.createManager.mockRejectedValue(
        new BadRequestException('Менеджер з таким email вже існує')
      );

      await expect(controller.createManager(createManagerDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getManagers', () => {
    it('should return filtered managers with default pagination', async () => {
      const query = { name: 'Олександр' };
      const expectedResult = {
        data: [{ id: 'test-id', name: 'Олександр', email: 'alex@example.com' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockManagersService.filterManagers.mockResolvedValue(expectedResult);

      const result = await controller.getManagers(query);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.filterManagers).toHaveBeenCalledWith(
        'Олександр', undefined, undefined, undefined, 1, 10
      );
    });

    it('should return filtered managers with custom pagination', async () => {
      const query = { 
        name: 'Олександр',
        email: 'alex@example.com',
        surname: 'Петренко',
        status: 'active',
        page: '2',
        limit: '5',
      };
      
      const expectedResult = {
        data: [{ id: 'test-id', name: 'Олександр', email: 'alex@example.com' }],
        total: 1,
        page: 2,
        limit: 5,
      };

      mockManagersService.filterManagers.mockResolvedValue(expectedResult);

      const result = await controller.getManagers(query);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.filterManagers).toHaveBeenCalledWith(
        'Олександр', 'alex@example.com', 'Петренко', 'active', 2, 5
      );
    });
  });

  describe('getCurrentManager', () => {
    it('should return manager info for manager role', async () => {
      const req = {
        user: {
          id: 'test-id',
          role: { name: RoleEnum.MANAGER },
        },
      };

      const expectedResult = {
        manager: { id: 'test-id', name: 'Олександр' },
        orderStats: { completed: 5, processing: 2 },
      };

      mockManagersService.getManagerById.mockResolvedValue(expectedResult);

      const result = await controller.getCurrentManager(req);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.getManagerById).toHaveBeenCalledWith('test-id');
    });

    it('should return admin info for admin role', async () => {
      const req = {
        user: {
          id: 'admin-id',
          role: { name: RoleEnum.ADMIN },
        },
      };

      const expectedResult = {
        admin: { id: 'admin-id', name: 'Admin' },
      };

      mockManagersService.getAdminInfo.mockResolvedValue(expectedResult);

      const result = await controller.getCurrentManager(req);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.getAdminInfo).toHaveBeenCalledWith('admin-id');
    });
  });

  describe('setPassword', () => {
    it('should set password successfully', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        email: 'alex@example.com',
        password: 'SecurePass123!',
        token: 'test-token',
      };

      const expectedResult = {
        message: 'Пароль успішно скинуто. Тепер можна входити.',
      };

      mockManagersService.setPassword.mockResolvedValue(expectedResult);

      const result = await controller.setPassword(updatePasswordDto);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.setPassword).toHaveBeenCalledWith(updatePasswordDto);
    });
  });

  describe('resetPassword', () => {
    it('should generate password reset link', async () => {
      const email = 'alex@example.com';
      const expectedResult = 'http://localhost:3000/managers/activate/reset-password/test-token';

      mockManagersService.generatePasswordResetLink.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(email);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.generatePasswordResetLink).toHaveBeenCalledWith(email);
    });
  });

  describe('getManagerById', () => {
    it('should return manager by id', async () => {
      const managerId = 'test-id';
      const expectedResult = {
        manager: { id: 'test-id', name: 'Олександр' },
        orderStats: { completed: 5, processing: 2 },
      };

      mockManagersService.getManagerById.mockResolvedValue(expectedResult);

      const result = await controller.getManagerById(managerId);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.getManagerById).toHaveBeenCalledWith(managerId);
    });

    it('should throw error if manager not found', async () => {
      const managerId = 'non-existent-id';

      mockManagersService.getManagerById.mockRejectedValue(
        new NotFoundException('Менеджер не знайдений')
      );

      await expect(controller.getManagerById(managerId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateManager', () => {
    it('should update manager', async () => {
      const managerId = 'test-id';
      const updateDto: Partial<CreateManagerDto> = {
        name: 'Новий Олександр',
        phone: '+380971234599',
      };

      const expectedResult = {
        id: 'test-id',
        name: 'Новий Олександр',
        email: 'alex@example.com',
        phone: '+380971234599',
      };

      mockManagersService.updateManager.mockResolvedValue(expectedResult);

      const result = await controller.updateManager(managerId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.updateManager).toHaveBeenCalledWith(managerId, updateDto);
    });
  });

  describe('deleteManager', () => {
    it('should delete manager', async () => {
      const managerId = 'test-id';
      const expectedResult = { message: 'Менеджер успішно видалений' };

      mockManagersService.deleteManager.mockResolvedValue(expectedResult);

      const result = await controller.deleteManager(managerId);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.deleteManager).toHaveBeenCalledWith(managerId);
    });
  });

  describe('banManager', () => {
    it('should ban manager', async () => {
      const managerId = 'test-id';
      const expectedResult = { message: 'Менеджер заблокований' };

      mockManagersService.changeManagerStatus.mockResolvedValue(expectedResult);

      const result = await controller.banManager(managerId);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.changeManagerStatus).toHaveBeenCalledWith(managerId, true);
    });
  });

  describe('unbanManager', () => {
    it('should unban manager', async () => {
      const managerId = 'test-id';
      const expectedResult = { message: 'Менеджер розблокований' };

      mockManagersService.changeManagerStatus.mockResolvedValue(expectedResult);

      const result = await controller.unbanManager(managerId);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.changeManagerStatus).toHaveBeenCalledWith(managerId, false);
    });
  });

  describe('getManagerStats', () => {
    it('should return manager stats', async () => {
      const managerId = 'test-id';
      const expectedResult = {
        manager: { id: 'test-id', name: 'Олександр' },
        orderStats: { completed: 5, processing: 2 },
      };

      mockManagersService.getManagerStats.mockResolvedValue(expectedResult);

      const result = await controller.getManagerStats(managerId);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.getManagerStats).toHaveBeenCalledWith(managerId);
    });
  });

  describe('generateActivationLink', () => {
    it('should generate activation link', async () => {
      const managerId = 'test-id';
      const expectedResult = 'http://localhost:3000/managers/activate/test-token';

      mockManagersService.generateActivationLink.mockResolvedValue(expectedResult);

      const result = await controller.generateActivationLink(managerId);

      expect(result).toEqual(expectedResult);
      expect(mockManagersService.generateActivationLink).toHaveBeenCalledWith(managerId);
    });
  });
});