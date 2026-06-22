import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { IdDto } from 'src/types/common.dto';

export class UpdateTourGuideMomentParamsDto extends IdDto {
  @ApiProperty({ example: '0df1ec7e-166e-4209-810a-23156b3b0489' })
  @IsUUID()
  momentId: string;
}
