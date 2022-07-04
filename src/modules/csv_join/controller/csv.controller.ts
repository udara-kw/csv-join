import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CSVService } from '../service/csv.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AllowedRoles } from '../../users/roles.decorator';
import { Role } from '../../users/enum/role.enum';
import { CSVByTagDto, CSVDto, ViewAllDto } from '../dto/csv';
import { Logger } from 'winston';
import { RolesGuard } from '../../users/roles.guard';

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
}
