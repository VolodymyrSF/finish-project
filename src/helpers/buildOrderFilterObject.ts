import { Equal, FindOptionsWhere, Like } from 'typeorm';
import { FilterOrdersDto } from '../modules/orders/dto/req/filter-orders.dto';
import { UserEntity } from '../database/entities/user.entity';
import { UpdateStatus } from '../database/entities/enums/update-status.enum';
import { Status } from '../database/entities/enums/order-status.enum';


export function buildOrderFilterObject(filters: FilterOrdersDto, user: UserEntity): FindOptionsWhere<any> {
  const where: FindOptionsWhere<any> = {};

  const textFields = ['name', 'surname', 'email', 'phone', 'course', 'course_format', 'course_type','utm','msg'];
  textFields.forEach(field => {
    if (filters[field]) {
      where[field] = Like(`%${filters[field]}%`);
    }
  });

  const numberFields = ['age', 'sum', 'id'];
  numberFields.forEach(field => {
    if (filters[field] !== undefined) {
      where[field] = filters[field];
    }
  });

  if (filters.status) {
    if (!Object.values(UpdateStatus).includes(filters.status as UpdateStatus)) {
      throw new Error(`Invalid status: ${filters.status}. Allowed: ${Object.values(UpdateStatus).join(', ')}`);
    }
    where.status = Equal(filters.status as Status | null);
  }

  if (filters.onlyMy) {
    where.manager = { id: user.id };
  }

  return where;
}
