import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ManagerResponseDto } from './manager.res.dto';
import { GroupResponseDto } from './group.response.dto';
import { CommentResponseDto } from './comment.response.dto';
import { GroupIdOnlyDto } from './group-id-only.dto';

export class OrderResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  surname: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  phone: string;

  @ApiProperty()
  @Expose()
  age: number;

  @ApiProperty()
  @Expose()
  course: string;

  @ApiProperty()
  @Expose()
  course_type: string;

  @ApiProperty()
  @Expose()
  course_format: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  utm: string;

  @ApiProperty()
  @Expose()
  msg: string;

  @ApiProperty()
  @Expose()
  sum: number;

  @ApiProperty()
  @Expose()
  alreadyPaid: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;


  @ApiProperty({ type: () => ManagerResponseDto, nullable: true })
  @Expose()
  @Type(() => ManagerResponseDto)
  manager: ManagerResponseDto;

  @ApiProperty({ type: () => GroupIdOnlyDto, nullable: true })
  @Expose()
  @Type(() => GroupIdOnlyDto)
  group: GroupIdOnlyDto;

  @ApiProperty({ type: () => [CommentResponseDto], required: false })
  @Expose()
  @Type(() => CommentResponseDto)
  comments?: CommentResponseDto[];
}
