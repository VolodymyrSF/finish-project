import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../orders.service';
import { OrdersRepository } from '../../repository/services/orders.repository';
import { ManagerRepository } from '../../repository/services/manager.repository';
import { GroupRepository } from '../../repository/services/group.repository';
import { DataSource } from 'typeorm';
import { Status } from '../../../database/entities/enums/order-status.enum';
import { OrderResponseDto } from '../dto/res/order.response.dto';
import { CommentResponseDto } from '../dto/res/comment.response.dto';
import { ManagerResponseDto } from '../dto/res/manager.res.dto';
import { UserEntity } from '../../../database/entities/user.entity';

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let ordersRepository: Partial<Record<keyof OrdersRepository, jest.Mock>>;
  let managersRepository: Partial<Record<keyof ManagerRepository, jest.Mock>>;
  let groupRepository: Partial<Record<keyof GroupRepository, jest.Mock>>;
  let dataSource: DataSource;

  const mockManager: ManagerResponseDto = {
    id: '2',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  };

  const mockOrder: Partial<OrderResponseDto> = {
    id: 1,
    name: 'Test User',
    surname: 'Test Surname',
    email: 'test@example.com',
    phone: '+1234567890',
    age: 25,
    course: 'FRONTEND',
    course_type: 'PRO',
    course_format: 'ONLINE',
    status: Status.New,
    utm: 'test_utm',
    msg: 'test message',
    sum: 1000,
    alreadyPaid: 0,
    comments: [],
    manager: mockManager,
    group: null
  };

  beforeEach(async () => {
    ordersRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    };
    managersRepository = {
      findOne: jest.fn().mockResolvedValue(mockManager),
    };

    groupRepository = {
      findOne: jest.fn(),
      find: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: ordersRepository },
        { provide: ManagerRepository, useValue: managersRepository },
        { provide: GroupRepository, useValue: groupRepository },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((callback) => callback()),
            createQueryRunner: jest.fn(() => ({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn()
            }))
          }
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add comment to order', async () => {
    const expectedComment: CommentResponseDto = {
      text: 'Test comment',
      author: mockManager.name,
      createdAt: expect.any(Date)
    };

    ordersRepository.findOne!.mockResolvedValue(mockOrder);
    ordersRepository.save!.mockResolvedValue({
      comment: expectedComment,
      manager: mockManager.name,
      status: Status.InWork
    });

    const result = await ordersService.addCommentToOrder(1, 'Test comment', mockManager as any);

    expect(result).toEqual({
      comment: expectedComment,
      manager: mockManager.name,
      status: Status.InWork
    });

    expect(ordersRepository.findOne).toHaveBeenCalledWith({
      where: { id: String(mockOrder.id) },
      relations: ['manager']
    });
  });

  it('should throw NotFoundException if order not found', async () => {
    ordersRepository.findOne!.mockResolvedValue(null);

    await expect(
      ordersService.addCommentToOrder(1, 'Test comment', mockManager as any),
    ).rejects.toThrow('Заявки не знайдено');

    expect(ordersRepository.findOne).toHaveBeenCalledWith({
      where: { id: String(mockOrder.id) },
      relations: ['manager']
    });
  });
});
