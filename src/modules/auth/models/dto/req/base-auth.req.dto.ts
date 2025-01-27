import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseUserReqDto } from '../../../../user/models/dto/req/base-user.req.dto';


export class BaseAuthReqDto extends PickType(BaseUserReqDto, [
  'email',
  'password',
  'name',
]) {
  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  readonly roleName: string;

}
