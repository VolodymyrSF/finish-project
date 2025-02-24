import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterOrdersDto {
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

  @ApiPropertyOptional({ description: 'Фільтр по статусу' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Фільтр по сумі' })
  @IsOptional()
  @IsNumber()
  sum?: number;

  @ApiPropertyOptional({ description: 'Фільтр тільки для ваших заявок' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  onlyMy?: boolean;
}
