import { Controller, Get, HttpStatus, Query, Req } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { formatApiResponse } from 'src/common/utils/format';
import { SearchingService } from './searching.service';
import {
  DestinationSuggestDto,
  HotSearchDto,
  ProductSuggestDto,
  SuggestQueryDto,
  SuggestResponseDto,
} from './dto/searching-suggestion.dto';

@ApiExtraModels(
  SuggestResponseDto,
  HotSearchDto,
  DestinationSuggestDto,
  ProductSuggestDto,
)
@Controller('searching')
export class SearchingController {
  constructor(private readonly searchingService: SearchingService) {}

  @Get('suggest')
  @ApiResponse({
    status: 200,
    description:
      'Get search suggestions with hot searches, destinations and products',
    schema: {
      properties: {
        data: { $ref: getSchemaPath(SuggestResponseDto) },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string', example: 'ok' },
      },
    },
  })
  async suggest(@Query() query: SuggestQueryDto, @Req() req: any) {
    const { keyword, userId } = query;

    const ipAddress: string =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket?.remoteAddress ||
      '';

    const result = await this.searchingService.getSuggestions(keyword);

    if (keyword) {
      await this.searchingService.create({ query: keyword, userId, ipAddress });
    }
    return formatApiResponse(result, HttpStatus.OK, 'ok');
  }
}
