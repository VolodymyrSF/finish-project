import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ description: 'Email менеджера', example: 'alex@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Новий пароль', example: 'SecurePass123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Пароль повинен містити щонайменше 8 символів' })
  password: string;
}
