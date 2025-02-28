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

  @ApiProperty({ description: 'Токен виданий в посиланні', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYW5hZ2VySWQiOiI2Zjg1YWNlZC1lZDQ4LTQxODQtYWM3Ny1iNzcxMWZjZjI5Y2YiLCJ0eXBlIjoiYWN0aXZhdGUiLCJpYXQiOjE3NDA1NjE5MTcsImV4cCI6MTc0MDU2MzcxN30.Ddx2pqncotjLl7WVKrBZRLGpvAVDR0pkGI2MjtNdTLg' })
  @IsNotEmpty()
  @IsString()
  token: string;
}
