import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsInt,
  IsOptional,
  IsEnum,
  IsArray,
  IsIn,
  ArrayUnique,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { SessionStatus } from '../entities/session.entity';
import { SessionUnitInputDto } from 'src/modules/session-unit/dto/session-unit-input.dto';

export enum DuplicateStrategy {
  SKIP = 'skip',
  OVERWRITE = 'overwrite',
}

export class CreateSessionRangeDto {
  @ApiProperty({ example: '42b1a09c-6fcb-4826-ba50-dfa24330c4f0' })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: '2026-08-01',
    description: 'Ngày bắt đầu (cũng là ngày duy nhất nếu không truyền toDate)',
  })
  @IsDateString()
  fromDate: string;

  @ApiPropertyOptional({
    example: '2026-08-05',
    description: 'Ngày kết thúc (bao gồm). Bỏ trống nếu chỉ tạo 1 ngày',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  //@ApiPropertyOptional({
  //  example: 20,
  //  description:
  //    'số khả dụng cho phép book, áp dụng cho tất cả session được tạo',
  //})
  //@IsOptional()
  //@Type(() => Number)
  //@IsInt()
  //@Min(0)
  //capacity?: number;

  @ApiPropertyOptional({
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @ApiPropertyOptional({
    type: [SessionUnitInputDto],
    description:
      'danh sách unit và giá áp dụng cho tất cả session được tạo trong khoảng ngày này',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionUnitInputDto)
  sessionUnits?: SessionUnitInputDto[];

  @ApiPropertyOptional({
    enum: DuplicateStrategy,
    default: DuplicateStrategy.SKIP,
    description:
      'Cách xử lý ngày đã có session sẵn: skip (bỏ qua, giữ nguyên) hoặc overwrite (ghi đè status/sessionUnits)',
  })
  @IsOptional()
  @IsEnum(DuplicateStrategy)
  duplicateStrategy?: DuplicateStrategy;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 3, 5],
    description:
      'Chỉ tạo session vào các thứ trong tuần được chọn (1=Thứ 2 ... 6=Thứ 7, 7=Chủ nhật). Bỏ trống nếu tạo tất cả các ngày trong khoảng',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn([1, 2, 3, 4, 5, 6, 7], { each: true })
  daysOfWeek?: number[];
}
