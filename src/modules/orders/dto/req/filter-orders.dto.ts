import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsIn, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterOrdersDto {
  @ApiPropertyOptional({ description: 'Номер сторінки', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber({}, { message: 'Page має бути числом' })
  @Min(1, { message: 'Page має бути більше або дорівнювати 1' })
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Поле для сортування', default: 'created_at' })
  @IsOptional()
  @IsString()
  orderBy?: string = 'id';

  @ApiPropertyOptional({ description: 'Напрямок сортування', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Фільтр по ID заявки' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber({}, { message: 'ID має бути числом' })
  id?: number;

  @ApiPropertyOptional({ description: 'Ім’я' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Прізвище' })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Телефон' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Вік' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber({}, { message: 'Age має бути числом' })
  @Min(0, { message: 'Age має бути більше або дорівнювати 0' })
  @Max(120, { message: 'Age має бути не більше 120' })
  age?: number;

  @ApiPropertyOptional({ description: 'Курс' })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiPropertyOptional({ description: 'Формат курсу' })
  @IsOptional()
  @IsString()
  course_format?: string;

  @ApiPropertyOptional({ description: 'Тип курсу' })
  @IsOptional()
  @IsString()
  course_type?: string;

  @ApiPropertyOptional({ description: 'Статус' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Сума' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'Сума має бути числом' })
  sum?: number;

  @ApiPropertyOptional({ description: 'Оплачено' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'Вже оплачено має бути числом' })
  alreadyPaid?: number;

  @ApiPropertyOptional({ description: 'Група' })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional({ description: 'Дата створення' })
  @IsOptional()
  @IsString()
  created_at?: string;

  @ApiPropertyOptional({ description: 'Менеджер' })
  @IsOptional()
  @IsString()
  manager?: string;
}
