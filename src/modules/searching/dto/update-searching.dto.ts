import { PartialType } from '@nestjs/swagger';
import { CreateSearchingDto } from './create-searching.dto';

export class UpdateSearchingDto extends PartialType(CreateSearchingDto) {}
