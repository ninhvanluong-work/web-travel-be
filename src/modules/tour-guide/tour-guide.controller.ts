import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';

import { formatApiResponse, getSchemaRefPath } from 'src/common/utils/format';
import {
  GetTourGuidesDto,
  GetTourGuidesResponseDto,
} from 'src/modules/tour-guide/dto/get-tour-guide.dto';
import { TourGuideService } from 'src/modules/tour-guide/tour-guide.service';

@Controller('tour-guide')
@ApiExtraModels(GetTourGuidesDto, GetTourGuidesResponseDto)
export class TourGuideController {
  constructor(private readonly tourGuideService: TourGuideService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'get tour guide list',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaRefPath('GetTourGuidesResponseDto'),
          },
        },
        code: { type: 'number', example: 200 },
        error: { type: 'null', example: null },
        message: { type: 'string' },
      },
    },
  })
  async findAll(@Query() query: GetTourGuidesDto) {
    const result = await this.tourGuideService.findAll(query);
    return formatApiResponse(
      result,
      HttpStatus.OK,
      'get tour guide successfully',
    );
  }
}
