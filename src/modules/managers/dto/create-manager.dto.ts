import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { IsStrictEmail } from '../../../helpers/email-validator.helper';

export class CreateManagerDto {
  @ApiProperty({ description: "Ім'я менеджера", example: 'Олександр' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: "Ім'я не може бути довшим за 100 символів" })
  name: string;

  @ApiProperty({ description: "Прізвище менеджера", example: 'Петренко' })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiProperty({ description: 'Email менеджера', example: 'alex@example.com' })
  @IsNotEmpty()
  @IsString()
  @IsStrictEmail()
  email: string;

  @ApiProperty({ description: 'Телефон менеджера', example: '+380971234567', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{10,15}$/, { message: 'Неправильний формат номера' })
  phone?: string;
}
