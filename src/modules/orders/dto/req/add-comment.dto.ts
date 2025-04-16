import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCommentDto {
  @ApiProperty({
    description: 'The comment to be added to the order',
    example: 'This is a test comment',
  })
  @IsString()
  comment: string;
}
