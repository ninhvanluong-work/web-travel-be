import { ApiProperty } from '@nestjs/swagger';
import { DestinationDto } from 'src/modules/destination/dto/destination-response.dto';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';

export class GetDestinationDto extends PaginationDto {}

export class GetDestinationsResponseDto extends ListItemsResponse<DestinationDto> {
  @ApiProperty({ type: [DestinationDto] })
  declare items: DestinationDto[];
}
