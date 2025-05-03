import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../orders.controller';
import { OrdersService } from '../orders.service';
import { JwtAccessGuard } from '../../guards/jwt-access.guard';
import { OrderAccessGuard } from '../../guards/order-access.guard';
import { FilterOrdersDto } from '../dto/req/filter-orders.dto';
import { Response } from 'express';
import { PaginatedOrdersResponseDto } from '../dto/res/paginated-orders.res.dto';
import { OrderResponseDto } from '../dto/res/order.response.dto';
import { CommentResponseDto } from '../dto/res/comment.response.dto';
import { Status } from '../../../database/entities/enums/order-status.enum';

// Import mocks
import { mockUser } from '../../../__mocks__/mock-user';
import { mockOrder } from '../../../__mocks__/mock-order';
import { ManagerResponseDto } from '../dto/res/manager.res.dto';

// Add a proper manager mock for response expectations
const mockManager: ManagerResponseDto = {
  id: '2',
  name: 'John',
  surname: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890'
};

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    getOrders: jest.fn(),
    getFilteredOrders: jest.fn(),
    addCommentToOrder: jest.fn(),
    updateOrder: jest.fn(),
    getAllFilteredOrders: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    })
      .overrideGuard(JwtAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(OrderAccessGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get filtered orders', async () => {
    const filters: Partial<FilterOrdersDto> = {
      name: 'John',
      page: 1,
      orderBy: 'created_at',
      order: 'DESC'
    };

    const expectedResponse: PaginatedOrdersResponseDto & { page: number } = {
      orders: [mockOrder as OrderResponseDto],
      total: 1,
      totalPages: 1,
      page: 1 // Add this line to match the actual response
    };

    mockOrdersService.getFilteredOrders.mockResolvedValue(expectedResponse);

    const response = await controller.getOrders(filters as FilterOrdersDto, mockUser);

    expect(response).toEqual(expectedResponse);
  });

  it('should add comment to order', async () => {
    const commentDto = { comment: 'Nice one!' };
    const expectedComment: CommentResponseDto = {
      text: 'Nice one!',
      author: mockManager.name,
      createdAt: expect.any(Date)
    };

    const expectedResponse = {
      ...mockOrder,
      status: Status.InWork,
      comments: [expectedComment],
      manager: mockManager, // <-- Use ManagerResponseDto here
      created_at: expect.any(Date)
    };

    mockOrdersService.addCommentToOrder.mockResolvedValue(expectedResponse);

    const response = await controller.addComment(1, commentDto, mockUser);

    expect(response).toEqual(expectedResponse);
  });

  it('should update order', async () => {
    const updateDto = {
      name: 'NewName',
      status: Status.InWork,
      sum: 2000
    };

    const expectedResponse = {
      ...mockOrder,
      ...updateDto
    };

    mockOrdersService.updateOrder.mockResolvedValue(expectedResponse);

    const result = await controller.updateOrder(1, updateDto, mockUser);

    expect(result).toEqual(expect.objectContaining({
      id: mockOrder.id,
      name: updateDto.name,
      status: updateDto.status,
      sum: updateDto.sum
    }));

    expect(service.updateOrder).toHaveBeenCalledWith(1, updateDto, mockUser);
  });

  it('should export orders', async () => {
    const filters: FilterOrdersDto = {};
    const mockOrders = [mockOrder];

    mockOrdersService.getAllFilteredOrders.mockResolvedValue(mockOrders);

    const mockRes = {
      setHeader: jest.fn(),
      end: jest.fn(),
    } as unknown as Response;

    await controller.exportOrders(filters, mockUser, mockRes); // <-- await here

    expect(mockOrdersService.getAllFilteredOrders).toHaveBeenCalledWith(filters, mockUser);
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename=orders.xlsx'
    );
    expect(mockRes.end).toHaveBeenCalled();
  });
});
