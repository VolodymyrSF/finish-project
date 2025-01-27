import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

import { TransformHelper } from '../../../../../helpers/transform.helper';

export class BaseUserReqDto {
  @IsOptional()
  @ApiProperty({ example: 'Admin' })
  @IsString()
  @Length(3, 50)
  @Transform(TransformHelper.trim)
  @Type(() => String)
  name?: string;

  @ApiProperty({ example: 'admin@gmail.com' })
  @IsString()
  @Length(0, 300)
  @Matches(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/)
  email: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @Length(0, 300)
  @Transform(TransformHelper.trim)
  @Type(() => String)
  password: string;

  @ApiProperty({ example: 'c56a4180-65aa-42ec-a945-5fd21dec0538' })
  @IsUUID()
  roleId: string;

  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  readonly roleName: string;

}
