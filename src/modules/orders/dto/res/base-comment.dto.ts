
import { ApiProperty } from '@nestjs/swagger';

export class BaseCommentDto {
  @ApiProperty({ description: 'Text of the comment' })
  text: string;

  @ApiProperty({ description: 'Name of the author of the comment' })
  author: string;

  @ApiProperty({ description: 'Date when the comment was created' })
  createdAt: Date;
}
