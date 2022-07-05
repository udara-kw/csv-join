import { ApiProperty } from '@nestjs/swagger';

export class CSVDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  tags: string[];
}

export class CSVByTagDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  tags: string[];
}

export class ViewAllDto {
  @ApiProperty()
  username: string;
}

export class UploadFileDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  files: any;
}

export class DownloadFileDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  filename: string;
}
