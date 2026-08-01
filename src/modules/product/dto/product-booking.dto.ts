import { ApiProperty } from '@nestjs/swagger';

import { DepartureTimeDto } from 'src/modules/departure-time/dto/departure-time-response.dto';
import { PickupLocationDto } from 'src/modules/pickup-location/dto/pickup-location-response.dto';
import { OptionDto } from 'src/modules/option/dto/option-response.dto';

export class ProductBookingInfoDto {
  @ApiProperty({ type: () => [DepartureTimeDto] })
  departureTimes: DepartureTimeDto[];

  @ApiProperty({ type: () => [PickupLocationDto] })
  pickupLocations: PickupLocationDto[];

  @ApiProperty({ type: () => [OptionDto] })
  options: OptionDto[];
}
