import { PickType } from '@nestjs/swagger';

import { BaseUserReqDto } from './base-user.req.dto';

export class CreateUserReqDto extends PickType(BaseUserReqDto, [
  'name',
  'email',
  'password',
  'roleName',
]) {}
