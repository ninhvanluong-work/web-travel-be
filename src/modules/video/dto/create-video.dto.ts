import { ApiProperty } from '@nestjs/swagger';
export class CreateVideoDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  url?: string;

  @ApiProperty({ nullable: true })
  thumbnail?: string;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty({ nullable: true })
  tag?: string;

  @ApiProperty({ nullable: true })
  embedding?: string;

  @ApiProperty({ nullable: true })
  productId?: string;
}
