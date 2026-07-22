import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTourSessionDto } from './create-tour-session.dto';

export class UpdateTourSessionDto extends PartialType(
  OmitType(CreateTourSessionDto, ['optionId'] as const),
) {}
