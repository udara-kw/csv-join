import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CSVService } from '../service/csv.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AllowedRoles } from '../../users/roles.decorator';
import { Role } from '../../users/enum/role.enum';
import {
  CSVByTagDto,
  CSVDto,
  DownloadFileDto,
  UploadFileDto,
  ViewAllDto,
} from '../dto/csv';
import { Logger } from 'winston';
import { RolesGuard } from '../../users/roles.guard';
import { Response } from 'express';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs/promises');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const appRoot = require('app-root-path');

@ApiTags('CSV')
@Controller('csv')
export class CSVController {
  constructor(
    private readonly csvService: CSVService,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  // Add new CSV to system
  @ApiBearerAuth('JWT')
  @Post('addOne')
  @AllowedRoles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addCSV(@Body() req: CSVDto): Promise<any> {
    return this.csvService.addOne(req.name, req.username, req.tags);
  }

  // View all csv files
  @ApiBearerAuth('JWT')
  @Get('viewAll/:username')
  @AllowedRoles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  viewAllCSV(@Param() params: ViewAllDto): Promise<any> {
    return this.csvService.viewAll(params.username);
  }

  // View all csv files
  @ApiBearerAuth('JWT')
  @Post('viewAll')
  @AllowedRoles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  viewAllByTag(@Body() req: CSVByTagDto): Promise<any> {
    return this.csvService.viewByTags(req.username, req.tags);
  }

  // View all csv files
  @ApiBearerAuth('JWT')
  @Get('viewAllFiles/:username')
  @AllowedRoles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  viewAllFiles(@Param() params: ViewAllDto): Promise<any> {
    return this.csvService.viewAllFiles(params.username);
  }

  // View all csv files
  @ApiBearerAuth('JWT')
  @Post('uploadFile')
  @AllowedRoles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async uploadCSV(@Body() req: UploadFileDto): Promise<{ success: boolean }> {
    return this.csvService.uploadFile(req.files, req.tags, req.username);
  }

  // View all csv files
  @ApiBearerAuth('JWT')
  @Post('downloadFiles')
  @AllowedRoles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async downloadCSVs(@Body() req: DownloadFileDto) {
    const filepath = join(process.cwd(), 'uploadCSVFiles', req.filename);
    try {
      const file = await fs.readFile(filepath);
      return file.toString();
    } catch (e) {
      throw new HttpException('no such file', HttpStatus.BAD_REQUEST);
    }
  }
}
