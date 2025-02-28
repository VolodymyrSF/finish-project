import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManagerSignInReqDto {
  @ApiProperty({
    description: 'The email of the manager',
    example: 'viktor@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the manager',
    example: 'SecurePass123!',
  })
  @IsString()
  password: string;
}
