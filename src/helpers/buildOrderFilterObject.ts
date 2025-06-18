import { Between, Equal, FindOptionsWhere, LessThanOrEqual, Like, MoreThanOrEqual } from 'typeorm';
import { FilterOrdersDto } from '../modules/orders/dto/req/filter-orders.dto';
import { UserEntity } from '../database/entities/user.entity';
import { Status } from '../database/entities/enums/order-status.enum';


export function buildOrderFilterObject(filters: FilterOrdersDto, user: UserEntity): FindOptionsWhere<any> {
  const where: FindOptionsWhere<any> = {};

  const textFields = [
    'name',
    'surname',
    'email',
    'phone',
    'course',
    'course_format',
    'course_type'
  ];

  textFields.forEach(field => {
    if (filters[field]) {
      where[field] = Like(`%${filters[field]}%`);
    }
  });

  const numberFields = [
    'id',
    'age',
    'sum',
    'alreadyPaid'
  ];
  numberFields.forEach(field => {
    if (filters[field] !== undefined && filters[field] !== null) {
      where[field] = filters[field];
    }
  });

  if (filters.status) {
    if (!Object.values(Status).includes(filters.status as Status)) {
      throw new Error(`Invalid status: ${filters.status}. Allowed: ${Object.values(Status).join(', ')}`);
    }
    where.status = Equal(filters.status as Status);
  }

  if (filters.group) {
    where.group = { name: filters.group };
  }

  if (filters.created_at) {
    where.created_at = filters.created_at;
  }

  if (filters.manager) {
    where.manager = { name: filters.manager };
  }

  if (filters.createdFrom && filters.createdTo) {
    where.created_at = Between(new Date(filters.createdFrom), new Date(filters.createdTo));
  } else if (filters.createdFrom) {
    where.created_at = MoreThanOrEqual(new Date(filters.createdFrom));
  } else if (filters.createdTo) {
    where.created_at = LessThanOrEqual(new Date(filters.createdTo));
  }

  return where;
}
