import { ApiProperty } from '@nestjs/swagger';

export class WhoisDto {
  @ApiProperty()
  domains: string[][];
}
