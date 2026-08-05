import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePickupLocationDto } from './create-pickup-location.dto';

export class UpdatePickupLocationDto extends PartialType(
  OmitType(CreatePickupLocationDto, ['productId'] as const),
) {}
