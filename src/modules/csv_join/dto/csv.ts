import { ApiProperty } from "@nestjs/swagger";

export class CSVDto {
  @ApiProperty()
  tld: string;

  @ApiProperty()
  registry: string;

  @ApiProperty()
  secret: string;
}