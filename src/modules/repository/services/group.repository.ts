import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GroupEntity } from '../../../database/entities/group.entity';

@Injectable()
export class GroupRepository extends Repository<GroupEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(GroupEntity, dataSource.manager);
  }
}
