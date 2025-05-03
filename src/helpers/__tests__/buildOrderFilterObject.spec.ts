import { buildOrderFilterObject } from '../buildOrderFilterObject';
import { FilterOrdersDto } from '../../modules/orders/dto/req/filter-orders.dto';
import { UserEntity } from '../../database/entities/user.entity';
import { Status } from '../../database/entities/enums/order-status.enum';

describe('buildOrderFilterObject', () => {
  const mockUser: UserEntity = { id: 1 } as any;

  it('should correctly map allowed filters', () => {
    const filters: FilterOrdersDto = {
      name: 'John',
      surname: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      age: 30,
      course: 'FS',
      course_format: 'online',
      course_type: 'pro',
      status: 'New',
      sum: 500,
      alreadyPaid: 200,
      group: 'FS-101',
      created_at: '2024-01-01',
      manager: 'Manager Name',
    };

    const where = buildOrderFilterObject(filters, mockUser);

    expect(where.name).toEqual(expect.any(Object)); // Like instance
    expect(where.surname).toEqual(expect.any(Object));
    expect(where.email).toEqual(expect.any(Object));
    expect(where.age).toEqual(30);
    expect(where.course).toEqual(expect.any(Object));
    expect(where.status).toEqual(expect.any(Object));
    expect(where.group).toEqual({ name: 'FS-101' });
    expect(where.manager).toEqual({ name: 'Manager Name' });
  });

  it('should throw an error for invalid status', () => {
    const filters: FilterOrdersDto = {
      status: 'INVALID' as any,
    };

    expect(() => buildOrderFilterObject(filters, mockUser)).toThrowError(/Invalid status/);
  });
});
