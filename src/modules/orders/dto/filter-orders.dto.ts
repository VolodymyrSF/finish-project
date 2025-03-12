
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterOrdersDto {

  @ApiPropertyOptional({ description: 'Номер сторінки', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Поле для сортування', default: 'created_at' })
  @IsOptional()
  @IsString()
  orderBy?: string = 'created_at';

  @ApiPropertyOptional({ description: 'Напрямок сортування', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Фільтр по ID заявки' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: 'Фільтр по імені' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Фільтр по прізвищу' })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiPropertyOptional({ description: 'Фільтр по email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Фільтр по телефону' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Фільтр по віку' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  age?: number;

  @ApiPropertyOptional({ description: 'Фільтр по курсу' })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiPropertyOptional({ description: 'Фільтр по формату курсу' })
  @IsOptional()
  @IsString()
  course_format?: string;

  @ApiPropertyOptional({ description: 'Фільтр по типу курсу' })
  @IsOptional()
  @IsString()
  course_type?: string;

  @ApiPropertyOptional({ description: 'Фільтр по статусу' },)
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Фільтр по сумі' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  sum?: number;

  @ApiPropertyOptional({ description: 'Фільтр тільки для ваших заявок' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  onlyMy?: boolean;
}

