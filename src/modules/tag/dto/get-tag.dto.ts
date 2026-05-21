import { ApiProperty } from '@nestjs/swagger';
import { TagDto } from 'src/modules/tag/dto/tag-response.dto';
import { ListItemsResponse, PaginationDto } from 'src/types/pagination.dto';

export class GetTagDto extends PaginationDto {}

export class GetTagsResponseDto extends ListItemsResponse<TagDto> {
  @ApiProperty({ type: [TagDto] })
  declare items: TagDto[];
}
