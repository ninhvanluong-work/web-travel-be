import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateOptionDto } from './create-option.dto';

export class UpdateOptionDto extends PartialType(
  OmitType(CreateOptionDto, ['productId'] as const),
) {}
