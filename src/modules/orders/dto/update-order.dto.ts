import { IsOptional, IsString, IsIn, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Course } from '../../../database/entities/enums/course.enum';
import { CourseType } from '../../../database/entities/enums/course-type.enum';
import { CourseFormat } from '../../../database/entities/enums/course-format.enum';
import { UpdateStatus } from '../../../database/entities/enums/update-status.enum';


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
  age?: number;

  @ApiPropertyOptional({
    description: 'Код курсу',
    enum: Course,
  })
  @IsOptional()
  @IsIn(Object.values(Course))
  course?: string;

  @ApiPropertyOptional({
    description: 'Тип курсу',
    enum: CourseType,
  })
  @IsOptional()
  @IsIn(Object.values(CourseType))
  course_type?: string;

  @ApiPropertyOptional({
    description: 'Формат курсу',
    enum: CourseFormat,
  })
  @IsOptional()
  @IsIn(Object.values(CourseFormat))
  course_format?: string;

  @ApiPropertyOptional({
    description: 'Статус заявки',
    enum: UpdateStatus,
  })
  @IsOptional()
  @IsIn(Object.values(UpdateStatus))
  status?: string;

  @ApiPropertyOptional({ description: 'Назва групи для заявки (створення нової групи, якщо її немає)' })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiPropertyOptional({ description: 'Сума заявки', type: Number })
  @IsOptional()
  @IsNumber()
  sum?: number;

  @ApiPropertyOptional({ description: 'Частина суми, яка вже оплачена', type: Number })
  @IsOptional()
  @IsNumber()
  alreadyPaid?: number;
}
