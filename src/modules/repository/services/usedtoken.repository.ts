import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UsedTokenEntity } from '../../../database/entities/used-token.entity';


@Injectable()
export class RoleRepository extends Repository<UsedTokenEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UsedTokenEntity, dataSource.manager);
  }
}
