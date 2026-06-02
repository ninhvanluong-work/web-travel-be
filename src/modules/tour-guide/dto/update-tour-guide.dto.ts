import { PartialType } from '@nestjs/swagger';
import { CreateTourGuideDto } from './create-tour-guide.dto';

export class UpdateTourGuideDto extends PartialType(CreateTourGuideDto) {}
