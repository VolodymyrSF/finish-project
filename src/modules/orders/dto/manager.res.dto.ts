import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ManagerResponseDto {
  @ApiProperty({ description: 'Ідентифікатор менеджера' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Ім’я менеджера' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Прізвище менеджера' })
  @Expose()
  surname: string;

  @ApiProperty({ description: 'Email менеджера' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Телефон менеджера' })
  @Expose()
  phone: string;
}
