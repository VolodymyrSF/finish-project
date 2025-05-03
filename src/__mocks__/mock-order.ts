import { OrderResponseDto } from '../modules/orders/dto/res/order.response.dto';
import { Status } from '../database/entities/enums/order-status.enum';
import { ManagerResponseDto } from '../modules/orders/dto/res/manager.res.dto';

export const mockManager: ManagerResponseDto = {
  id: '2',
  name: 'John',
  surname: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890'
};

export const mockOrder: OrderResponseDto = {
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