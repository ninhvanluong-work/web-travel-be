import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class HttpResult<T> {
  @ApiProperty({ description: 'Response data', example: {} })
  data?: T | null;

  @ApiProperty({ description: 'Response message', example: 200 })
  message?: string;

  @ApiProperty({ description: 'Error data', example: {} })
  error?: string | null;

  @ApiProperty({ description: 'Response code', example: 200 })
  code?: HttpStatus;
}
