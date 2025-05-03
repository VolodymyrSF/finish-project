import { IsOptional, IsString, IsIn, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Course } from '../../../../database/entities/enums/course.enum';
import { CourseType } from '../../../../database/entities/enums/course-type.enum';
import { CourseFormat } from '../../../../database/entities/enums/course-format.enum';
import { UpdateStatus } from '../../../../database/entities/enums/update-status.enum';

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: 'Ім’я клієнта' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Прізвище клієнта' })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiPropertyOptional({ description: 'Email клієнта' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Телефон клієнта' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Вік клієнта' })
  @IsOptional()
  @IsNumber({}, { message: 'Вік має бути числом' })
  @Min(0, { message: 'Вік має бути більшим або дорівнювати 0' })
  @Max(120, { message: 'Вік має бути не більше 120' })
  age?: number;

  @ApiPropertyOptional({ description: 'Код курсу', enum: Course })
  @IsOptional()
  @IsIn(Object.values(Course))
  course?: string;

  @ApiPropertyOptional({ description: 'Тип курсу', enum: CourseType })
  @IsOptional()
  @IsIn(Object.values(CourseType))
  course_type?: string;

  @ApiPropertyOptional({ description: 'Формат курсу', enum: CourseFormat })
  @IsOptional()
  @IsIn(Object.values(CourseFormat))
  course_format?: string;

  @ApiPropertyOptional({ description: 'Статус заявки', enum: UpdateStatus })
  @IsOptional()
  @IsIn(Object.values(UpdateStatus))
  status?: string;

  @ApiPropertyOptional({ description: 'Назва групи для заявки' })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiPropertyOptional({ description: 'Опис групи' })
  @IsOptional()
  @IsString()
  GroupDescription?: string;

  @ApiPropertyOptional({ description: 'Сума заявки' })
  @IsOptional()
  @IsNumber({}, { message: 'Сума має бути числом' })
  sum?: number;

  @ApiPropertyOptional({ description: 'Частина суми, яка вже оплачена' })
  @IsOptional()
  @IsNumber({}, { message: 'Вже оплачено має бути числом' })
  alreadyPaid?: number;
}
