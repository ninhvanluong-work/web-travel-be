import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDepartureTimeDto } from './create-departure-time.dto';

export class UpdateDepartureTimeDto extends PartialType(
  OmitType(CreateDepartureTimeDto, ['optionId'] as const),
) {}
