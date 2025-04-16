
import { EntityManager } from 'typeorm';
import { UpdateOrderDto } from '../modules/orders/dto/req/update-order.dto';
import { GroupEntity } from '../database/entities/group.entity';

export async function handleGroup(
  dto: UpdateOrderDto,
  manager: EntityManager,
): Promise<GroupEntity | undefined> {
  if (!dto.groupName) return undefined;

  let group = await manager.findOne(GroupEntity, { where: { name: dto.groupName } });

  if (!group) {
    group = manager.create(GroupEntity, {
      name: dto.groupName,
      description: dto.GroupDescription ?? 'Створено автоматично',
    });
  } else if (dto.GroupDescription !== undefined) {
    group.description = dto.GroupDescription;
  }

  return await manager.save(group);
}
